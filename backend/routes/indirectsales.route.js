import express from "express";
import indirectSales from "../models/indirectsales.model.js";
import SalesStock from "../models/salesstock.model.js";
const router = express.Router();

// Save sales record
router.post("/add", async (req, res) => {
  try {
    console.log("Received sales data:", JSON.stringify(req.body, null, 2));
    const { buyerId, items, totalAmount } = req.body;

    // Validate required fields
    if (!buyerId) {
      console.log("Missing buyerId");
      return res.status(400).json({ message: "Buyer ID is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("Invalid items array:", items);
      return res.status(400).json({ message: "Valid items array is required" });
    }
    if (!totalAmount || isNaN(totalAmount)) {
      console.log("Invalid totalAmount:", totalAmount);
      return res
        .status(400)
        .json({ message: "Valid total amount is required" });
    }

    // Validate each item
    for (const item of items) {
      if (!item.itemName || !item.quantity || !item.price || !item.total) {
        console.log("Invalid item data:", item);
        return res.status(400).json({
          message: "Each item must have itemName, quantity, price, and total",
          invalidItem: item,
        });
      }
    }

    // Get all stock items for debugging
    const allStockItems = await SalesStock.find({});
    console.log(
      "All stock items in database:",
      JSON.stringify(allStockItems, null, 2)
    );

    // Check if all items have sufficient stock
    for (const item of items) {
      console.log("Checking stock for item:", item);
      console.log("Item name length:", item.itemName.length);
      console.log("Item name chars:", JSON.stringify(item.itemName));
      
      // Try multiple matching strategies
      let stock = null;
      const searchName = item.itemName.trim();
      
      // Strategy 1: Exact match
      stock = await SalesStock.findOne({
        sp_name: searchName,
      });
      
      if (!stock) {
        // Strategy 2: Case-insensitive exact match
        stock = await SalesStock.findOne({
          sp_name: { $regex: new RegExp(`^${searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
        });
      }
      
      if (!stock) {
        // Strategy 3: Try to match against all stock items character by character
        for (const stockItem of allStockItems) {
          if (stockItem.sp_name.trim().toLowerCase() === searchName.toLowerCase()) {
            stock = stockItem;
            break;
          }
        }
      }

      if (!stock) {
        const availableItems = allStockItems
          .map((item) => item.sp_name)
          .join(", ");
        console.log("Item not found in stock:", item.itemName);
        return res.status(400).json({
          message: `Stock not found for item "${item.itemName}". Available items: ${availableItems}`,
          availableItems: allStockItems.map((item) => ({
            name: item.sp_name,
            quantity: item.sp_quantity,
          })),
        });
      }
      if (stock.sp_quantity < item.quantity) {
        console.log("Insufficient stock:", {
          item: item.itemName,
          available: stock.sp_quantity,
          requested: item.quantity,
        });
        return res.status(400).json({
          message: `Insufficient stock for "${item.itemName}". Available: ${stock.sp_quantity}, Requested: ${item.quantity}`,
        });
      }
    }

    // Create a new sale record
    const indirectsale = new indirectSales({
      buyerId,
      items,
      totalAmount,
      date: new Date(),
    });

    console.log(
      "Attempting to save sale with data:",
      JSON.stringify(
        {
          buyerId,
          items,
          totalAmount,
          date: new Date(),
        },
        null,
        2
      )
    );

    // Save the sale
    try {
      const savedSale = await indirectsale.save();
      console.log("Sale saved successfully with ID:", savedSale._id);
      console.log(
        "Full saved sale document:",
        JSON.stringify(savedSale, null, 2)
      );

      // Verify the sale exists in the database
      const verifiedSale = await indirectSales.findById(savedSale._id);
      if (!verifiedSale) {
        console.error("Failed to verify sale in database after save");
        throw new Error("Sale verification failed");
      }
      console.log(
        "Verified sale in database:",
        JSON.stringify(verifiedSale, null, 2)
      );
    } catch (saveError) {
      console.error("Error saving sale:", saveError);
      console.error("Error code:", saveError.code);
      console.error("Error name:", saveError.name);
      console.error("Error message:", saveError.message);
      console.error("Error stack:", saveError.stack);

      if (saveError.code === 11000) {
        // If we get a duplicate key error, try one more time with a new invoice ID
        console.log("Duplicate key error, retrying with new invoice ID");
        indirectsale.invoiceId = `INV-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;
        const retrySale = await indirectsale.save();
        console.log("Sale saved successfully on retry with ID:", retrySale._id);
      } else if (saveError.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          error: saveError.message,
          details: saveError.errors,
        });
      } else {
        throw saveError;
      }
    }

    // Update stock quantities
    for (const item of items) {
      try {
        const searchName = item.itemName.trim();
        let result = null;
        
        // Strategy 1: Exact match
        result = await SalesStock.findOneAndUpdate(
          { sp_name: searchName },
          { $inc: { sp_quantity: -item.quantity } },
          { new: true }
        );
        
        if (!result) {
          // Strategy 2: Case-insensitive exact match
          result = await SalesStock.findOneAndUpdate(
            { sp_name: { $regex: new RegExp(`^${searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") } },
            { $inc: { sp_quantity: -item.quantity } },
            { new: true }
          );
        }
        
        if (!result) {
          // Strategy 3: Find by character matching and update
          const stockItem = await SalesStock.findOne({});
          const allStockItems = await SalesStock.find({});
          for (const stock of allStockItems) {
            if (stock.sp_name.trim().toLowerCase() === searchName.toLowerCase()) {
              stock.sp_quantity -= item.quantity;
              await stock.save();
              result = stock;
              break;
            }
          }
        }
        
        console.log(`Updated stock for ${item.itemName}:`, result);
      } catch (stockError) {
        console.error(`Error updating stock for ${item.itemName}:`, stockError);
        // Continue with other items even if one fails
      }
    }

    res.status(201).json({
      success: true,
      message: "Sale recorded successfully",
      sale: indirectsale,
    });
  } catch (error) {
    console.error("Detailed error in /add route:", error);
    console.error("Error stack:", error.stack);
    console.error("Error code:", error.code);
    console.error("Error name:", error.name);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
        details: error.errors,
      });
    }

    res.status(500).json({
      message: "Error adding sale",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Fetch all sales records
router.get("/", async (req, res) => {
  try {
    const indirectsales = await indirectSales.find().sort({ date: -1 });
    res.status(200).json({
      success: true,
      sales: indirectsales,
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales",
      error: error.message,
    });
  }
});

// Fetch single sale details by invoiceId
router.get("/:invoiceId", async (req, res) => {
  try {
    const indirectsale = await indirectSales.findOne({
      invoiceId: req.params.invoiceId,
    });
    if (!indirectsale) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    res.status(200).json({
      success: true,
      sale: indirectsale,
    });
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sale",
      error: error.message,
    });
  }
});

export default router;
