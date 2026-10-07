import image1 from "../assets/image1.png";

// Shared shell for Login and SignUp: form on the left, image on the right.
// On small screens the image is hidden and the form takes the full card.
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#D8D0C4] p-4 sm:p-8">
      <div className="flex w-full max-w-[1080px] overflow-hidden rounded-[32px] bg-white p-4 sm:rounded-[52px] md:h-[720px]">
        <div className="flex w-full items-center justify-center px-2 py-10 md:w-1/2">
          <div className="w-full max-w-[360px]">
            <p className="mb-8 text-center text-2xl font-bold tracking-tight text-[#303030]">
              Shop<span className="text-[#ff6b35]">Kart</span>
            </p>

            <div className="mb-8 text-center">
              <h1 className="text-[30px] font-semibold tracking-[-1.5px] text-[#303030]">
                {title}
              </h1>
              <p className="mt-2 text-sm text-[#999999]">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>

        <div className="hidden md:block md:w-1/2">
          <div className="h-full w-full overflow-hidden rounded-[38px]">
            <img
              src={image1}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const inputClass =
  "h-[46px] w-full rounded-full border border-[#d5d5d5] px-6 text-sm text-[#333] outline-none transition placeholder:text-[#b4b4b4] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/10";

export const buttonClass =
  "mt-6 h-[46px] w-full rounded-full bg-[#303030] text-sm font-semibold text-white transition hover:bg-[#ff6b35] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

export default AuthLayout;
