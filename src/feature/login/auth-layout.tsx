import SiteLogo from "@/components/SiteLogo.tsx";

interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='relative min-h-svh flex items-center justify-center overflow-hidden bg-[#0D0D0F]'>
      {/* Electric Blue radial glow */}
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(230_100%_62%_/_0.12),transparent)]' />
      {/* subtle grid texture */}
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(230_100%_62%_/_0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(230_100%_62%_/_0.03)_1px,transparent_1px)] bg-[size:48px_48px]' />

      <div className='relative z-10 mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-4 flex items-center justify-center gap-2.5'>
          <SiteLogo withText={false} />
          <h1 className='text-xl font-semibold text-white font-sora'>Luka Dev Studio</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
