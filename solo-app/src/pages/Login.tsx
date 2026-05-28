import { useNavigate } from 'react-router-dom';

export function Login() {
  const nav = useNavigate();
  return (
    <div className="bg-p min-h-screen flex items-center justify-center">
      <div className="glass p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold grad-text mb-2">Solo OS</div>
          <div className="ts text-sm">AI-Powered Company Operating System</div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); nav('/'); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium tp mb-1">Email</label>
            <input type="email" defaultValue="founder@soloai.com" className="inp" />
          </div>
          <div>
            <label className="block text-sm font-medium tp mb-1">Password</label>
            <input type="password" defaultValue="demo123" className="inp" />
          </div>
          <button type="submit" className="btn-p w-full justify-center">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}
