import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "aos/dist/aos.css";
import AOS from "aos";

import "../tnr/css/main.css";
import "../tnr/css/swiper.css";


const TnrHome = () => {
  const navigate = useNavigate();  // <-- added

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const userLogin = () => {
    navigate('/login');  // <-- changed to navigate to login page
  };

  return (
    <div>
      <div className="container-fluid jumbo" id="jumbo">
        <div className="container h-100 pt-5">
          <div className="row h-100">
            <div className="col-md-5 v-center-box balanced">
              <img
                src="media/logo.webp"
                style={{ width: '280px', maxWidth: '80%' }}
                alt="TNR"
                data-aos="fade-down"
                data-aos-duration="3000"
              />
              <br />
              <img
                src="media/intro.png"
                className="intro-ttl"
                alt=""
                data-aos="fade-up"
                data-aos-duration="3000"
              />
              <br />
              Sri Lanka’s leading provider of construction materials. From roofing to steel and cement bricks, we’re committed to delivering innovative solutions that meet the highest standards of quality and reliability. With over 25 years of experience, we are your trusted partner for projects big and small.
              <button className="jumbo-btn" onClick={userLogin}>
                User Login
              </button>
            </div>
            <div className="col-md-7 jumbo-hl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="jumbo-hl-vdo"
                data-aos="fade-up"
                data-aos-duration="3000"
              >
                <source src="media/hl.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="container-fluid bgwhite">
        <div className="container section">
          <div className="row">
            <div className="col-md-6">
              <div className="section-ttl" data-aos="fade-down-right">
                Our Divisions
              </div>
            </div>
          </div>

          <div className="row sectors-grid">
            {[
              {
                class: 'tnr-ent',
                title: 'TNR ENTERPRISES',
                desc: 'Distributing building materials to\nHardware stores Island wide.',
              },
              {
                class: 'tnr-roof',
                title: 'TNR Roofing',
                desc: 'Premium roofing solutions designed for Sri Lanka’s diverse weather conditions.',
              },
              {
                class: 'tnr-is',
                title: 'TNR Ironwill Steel',
                desc: 'Leading in steel production and refabrication for strong and durable structures.',
              },
              {
                class: 'tnr-cb',
                title: 'TNR Cement Bricks',
                desc: 'Manufacturer of eco-friendly cement blocks and interlock paving.',
              },
              {
                class: 'tnr-show',
                title: 'TNR Showroom',
                desc: 'Retailing our diverse product range in Wennappuwa and surrounding areas.',
              },
            ].map((item, index) => (
              <div
                className={`col-md-${index < 2 ? 6 : 4}`}
                key={index}
              >
                <div className="sector" data-aos="zoom-out" data-aos-delay={100 + index * 50}>
                  <div className={`sector-bg ${item.class}`}></div>
                  <div className="sector-ttl">{item.title}</div>
                  <div className="sector-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="container-fluid bgwhite blue-top-line">
        <div className="container section">
          <div className="row">
            <div className="col-md-12">
              <div className="section-ttl" data-aos="fade-down-right">
                Why Choose TNR Group
              </div>
              <div className="space"></div>
            </div>

            {[
              'Over 25 years of trusted service in the construction industry.',
              'Comprehensive product range for all construction and agricultural needs.',
              'Reliable and consistent quality, trusted by contractors and homeowners alike.',
              'Islandwide availability with an extensive distribution network.',
            ].map((text, index) => (
              <div className="col-6 col-md-3 why-box" key={index}>
                <img
                  src={`media/why${index + 1}.png`}
                  className="why-tick"
                  alt=""
                  data-aos="fade-up"
                  data-aos-delay={100 + index * 50}
                />
                <span className="why-text">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container-fluid bgblue">
        <div className="container section">
          <div className="row">
            <div className="col-md-6">
              <div className="section-ttl" data-aos="fade-down-right">
                Products
              </div>
            </div>
          </div>

          <div className="row products-grid">
            {[
              { img: 'ra.jpg', cat: 'TNR Roofing', title: 'TNR Roofing Accessories' },
              { img: 'ss.png', cat: 'TNR Ironwill Steel', title: 'Steel Stirrups' },
              { img: 'znalrs.jpg', cat: 'TNR Roofing', title: 'Zn/ Al Roofing Sheets' },
              { img: 'wn.png', cat: 'TNR Ironwill Steel', title: 'Wire Nails' },
              { img: 'bw.png', cat: 'TNR Ironwill Steel', title: 'Barbed Wire' },
              { img: 'girs.jpg', cat: 'TNR Roofing', title: 'GI Roofing Sheets' },
              { img: 'cb.png', cat: 'TNR Cement Bricks', title: 'Cement Blocks & Interlock Paving' },
            ].map((prod, index) => (
              <div className="col-12 col-sm-6 col-md-4 col-xl-3" key={index}>
                <a className="product">
                  <div className="prod-img">
                    <img src={`products/${prod.img}`} alt="" />
                  </div>
                  <div className="prod-text">
                    <div className="prod-cat">{prod.cat}</div>
                    <div className="prod-ttl">{prod.title}</div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="container-fluid bgwhite">
        <div className="container section">
          <div className="row">
            <div className="col-md-6">
              <div className="section-ttl" data-aos="fade-down-right">Brands</div>
            </div>
          </div>
          <div className="row brands-grid">
            <div className="col-md-12">
              <div className="swiper swiper-brands">
                <div className="swiper-wrapper swiper-brands-wrapper">
                  {['melwa.png', 'janatha.jpg', 'gtb.jpeg'].map((brand, i) => (
                    <React.Fragment key={i}>
                      <div className="swiper-slide">
                        <img className="brands-logos" src={`media/brands/${brand}`} alt="" />
                      </div>
                      <div className="swiper-slide">
                        <img className="brands-logos" src={`media/brands/${brand}`} alt="" />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <div className="swiper-pagination"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Let's Talk Form */}
      <div className="container-fluid bgblue" id="letstalk">
        <div className="container section">
          <div className="row">
            <div className="col-md-4">
              <div className="section-ttl deskonly" data-aos="fade-down-right"><span className="oneline">Let's</span> Talk</div>
              <div className="section-ttl mobonly" data-aos="fade-down-right">Let's Talk</div>
              <br />
              <ul>
                <li>We will respond to you within 24 hours.</li>
                <li>Access to dedicated product specialists.</li>
              </ul>
            </div>
            <div className="col-md-8">
              <div className="quick-cont-box">
                <form action="send-lets-talk-box.php" method="POST" className="contact-box">
                  <div className="form-floating">
                    <select className="form-select cont-input" name="inquiryType" required>
                      <option disabled selected>Please select . . .</option>
                      <option value="Quote Request">Get a Quote</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Project Inquiry">Project Inquiry</option>
                      <option value="Complaint">Complaint Submission</option>
                      <option value="Other Inquiry">Other</option>
                    </select>
                    <label>Purpose of your Inquiry</label>
                  </div>
                  <div className="form-floating">
                    <input type="text" className="form-control cont-input" name="name" placeholder="Sunil Perera" required />
                    <label>Your Name</label>
                  </div>
                  <div className="form-floating">
                    <input type="email" className="form-control cont-input" name="email" placeholder="sunil@gmail.com" required />
                    <label>Email Address</label>
                  </div>
                  <div className="form-floating">
                    <input type="text" className="form-control cont-input" name="mobile" placeholder="0777123456" required />
                    <label>Mobile Number</label>
                  </div>
                  <div className="form-floating">
                    <textarea className="form-control cont-input" name="details" placeholder="Explanation" style={{ height: '100px' }} required></textarea>
                    <label>More Details of your Inquiry</label>
                  </div>
                  <div className="text-end">
                    <button type="submit" className="cont-subm">
                      Send a Message <i className="fa-regular fa-paper-plane"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container-fluid footer">
        <div className="container section">
          <div className="row">
            <div className="col-md-12 footer-2">
              <img src="media/logo.webp" className="footer-logo" alt="" />
              <hr className="nav-hr" />
              <div className="footer-socials">
                <a href="https://www.facebook.com/TNRsrilanka" target="_blank" rel="noreferrer" className="footer-social">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="https://www.instagram.com/tnrsrilanka" target="_blank" rel="noreferrer" className="footer-social">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="https://www.linkedin.com/company/tnrsrilanka/" target="_blank" rel="noreferrer" className="footer-social">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TnrHome;
