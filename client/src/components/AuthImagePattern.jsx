export default function AuthImagePattern({ title, subtitle }) {
  return (
    <div className='hidden lg:flex items-center justify-center bg-slate-900 p-12'>
      <div className='max-w-md text-center '>
        <div className='grid grid-cols-3 gap-3 mb-6'>
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl w-[135px] h-[120px] bg-primary/10 ${
                i % 2 === 0 ? "animate-pulse" : ""
              }`}
            />
          ))}
        </div>
        <h2 className='text-2xl font-bold mb-2 text-primary'>{title}</h2>
        <p className='text-gray-300'>{subtitle}</p>
      </div>
    </div>
  );
}
