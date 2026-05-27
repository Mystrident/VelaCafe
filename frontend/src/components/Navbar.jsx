import { HiMenu } from "react-icons/hi";

function Navbar() {
  const scrollToMenu = () => {
    const section = document.getElementById("menu-section");

    section.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div
      className="
        fixed
        top-0
        left-0
        w-full
        z-50
        bg-[#f8efe3]
        border-b
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-10
          py-4
          flex
          justify-between
          items-center
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <img
            src="/vela_cafe_logo.jpeg"
            alt="logo"
            className="
              w-12
              h-12
              md:w-16
              md:h-16
              object-cover
              rounded-full
            "
          />

          <div>
            <h1
              className="
                text-2xl
                md:text-4xl
                font-black
                text-[#5c1f16]
              "
            >
              VELAA
            </h1>

            <p
              className="
                text-xs
                md:text-sm
                tracking-[4px]
                text-[#8b5e3c]
              "
            >
              CAFÉ
            </p>
          </div>
        </div>

        <div
          className="
            hidden
            md:flex
            items-center
            gap-12
            font-bold
            text-[#5c1f16]
          "
        >
          <button>HOME</button>

          <button onClick={scrollToMenu}>MENU</button>

          <button>CONTACT</button>
        </div>

        <button
          className="
            md:hidden
            text-3xl
            text-[#5c1f16]
          "
        >
          <HiMenu />
        </button>
      </div>
    </div>
  );
}

export default Navbar;
