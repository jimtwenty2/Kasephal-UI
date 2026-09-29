export default function GoToDashboard() {
  return (
    <a
      href="#how-it-work"
      className="w-full sm:w-auto"
    >
      <button
        type="button"
        className="
          flex
          h-12
          w-full
          items-center
          justify-center
          rounded-4xl
          border-2
          border-white
          px-8
          text-[15px]
          font-semibold
          text-white
          transition-all
          duration-300
          hover:scale-[1.02]
          hover:opacity-90
          sm:w-55
        "
      >
        How it Works
      </button>
    </a>
  );
}