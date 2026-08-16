function Footer() {
  return (
    <footer id="contact-section" className="bg-[#2a110a] text-white mt-10 rounded-t-[3rem] shadow-[0_-20px_50px_rgb(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-20 grid md:grid-cols-2 gap-16 items-center">
        
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white/90">
            VELAA CAFÉ
          </h1>
          <p className="text-lg text-white/60 leading-relaxed font-medium max-w-md">
            Fresh café food, quick pickup, and a smooth ordering experience for
            SASTRA students.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/10">📞</div>
              <p className="text-lg font-bold text-white/80">+91 89034 12927</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/10">📍</div>
              <p className="text-lg font-bold text-white/80 max-w-[250px] leading-tight">
                Inside SASTRA Deemed University, Thanjavur
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="bg-orange-500 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20 active:scale-95"
              >
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl h-[350px] md:h-[400px] border-4 border-white/5 relative group">
          {/* Subtle overlay on the map */}
          <div className="absolute inset-0 bg-orange-500/10 pointer-events-none group-hover:bg-transparent transition-colors duration-500 z-10" />
          <iframe
            title="map"
            src="https://maps.google.com/maps?q=SASTRA%20Deemed%20University&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="border-0 w-full h-full grayscale-[20%] contrast-[1.1]"
          />
        </div>

      </div>

      <div className="border-t border-white/10 py-8 text-center">
        <p className="text-white/40 font-semibold text-sm tracking-widest uppercase">
          © {new Date().getFullYear()} VELAA CAFÉ. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
