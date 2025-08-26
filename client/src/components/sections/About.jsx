import Wave from "../../assets/wave1.png";
import ChickyHero from "../../assets/chickyHero-right.png";
import EggTray from "../../assets/egg-tray.png";

export default function About() {
  return (
    <div className="relative flex flex-col items-center justify-center z-5 pb-10" id="about-us">
      <div className="relative w-full mb-10 bg-white">
        <div className="relative z-1 flex flex-col items-center justify-center w-full">
          <h2 className="text-primaryYellow font-bold text-5xl">About Us</h2>
        </div>
        <img src={Wave} className="absolute top-0 right-0 " />
        <img src={Wave} className="absolute top-10 right-1  " />
        <img src={Wave} className="absolute top-10 left-[-50px]  " />
      </div>
      <div className="w-full flex flex-col">
        <div className="flex flex-row items-center justify-between pl-50 px-20">
          <div className="">
            <img src={ChickyHero} className="relative z-5" />
          </div>
          <div className="flex flex-col gap-2 mt-30">
            <h1 className="font-black text-6xl leading-tight">
              Bringing Freshness Straight <br /> from{" "}
              <span className="bg-white text-primaryYellow">
                Bantayan Island
              </span>{" "}
            </h1>
            <p className="text-xl w-[800px] font-semibold">
              Our eggs come straight from the dedicated farmers of Bantayan
              Island, guaranteeing freshness, quality, and fair pricing. By
              sourcing directly, we support local farmers while bringing you the
              best eggs—fresh from farm to table!
            </p>
          </div>
        </div>
        <div className="relative flex flex-row items-center justify-start">
          <div className="flex flex-col gap-2 px-50">
            <h1 className="font-black text-white text-6xl leading-tight">
              Our Mission{" "}
            </h1>
            <p className="text-xl w-[800px] font-semibold">
              At Chickify, we aim to create a sustainable marketplace where
              local egg farmers can thrive while customers enjoy high-quality
              eggs at affordable prices. We believe in fair trade, transparency,
              and empowering small-scale farmers.
            </p>
          </div>

            <img src={EggTray} className="absolute right-0 bottom-[-50px] z-1 w-2/7" />
        </div>
      </div>
    </div>
  );
}
