function Footer() {
  return (
    <footer
      id="contact-section"
      className="
        bg-[#4b1e14]
        text-white
        mt-20
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-10
          py-16
          grid
          md:grid-cols-2
          gap-12
        "
      >
        <div>
          <h1
            className="
              text-4xl
              font-black
              mb-6
            "
          >
            VELAA CAFÉ
          </h1>

          <p className="text-lg text-gray-300 leading-relaxed">
            Fresh café food, quick pickup, and smooth ordering experience for
            students.
          </p>

          <div className="mt-8 space-y-4">
            <p className="text-lg">📞 +91 89034 12927</p>

            <p className="text-lg">
              📍 Inside SASTRA Deemed University, Thanjavur
            </p>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="
                text-orange-400
                text-lg
                hover:text-orange-300
              "
            >
              Instagram
            </a>
          </div>
        </div>

        <div
          className="
            rounded-3xl
            overflow-hidden
            shadow-2xl
            min-h-[300px]
          "
        >
          <iframe
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3915.305312063882!2d76.95583247480774!3d11.088210253746288!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859fdf6b2db2b%3A0x2b6b3e5b6f9f0b1!2sVelammal%20Engineering%20College!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="border-0 w-full h-full"
          />
        </div>
      </div>

      <div
        className="
          border-t
          border-white/10
          py-6
          text-center
          text-gray-400
        "
      >
        © 2026 VELAA CAFÉ. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
