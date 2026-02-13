import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card } from "@/Components/ui/card";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface LoginProps {
    onLoginSuccess: (user: any) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await (window as any).axios.post("/login", { email, password });

            if (response.status === 200) {
                toast.success("Login Successful", { description: "Welcome back to ERIS" });
                setTimeout(() => {
                    onLoginSuccess(response.data.user);
                }, 500);
            }
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.response?.data?.message || "Invalid email or password.");
            toast.error("Login Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1120] relative overflow-hidden">
            {/* Professional Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />

            <Card className="w-full max-w-[400px] p-8 bg-[#0f172a]/80 backdrop-blur-xl border-slate-800 shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="mb-4 flex justify-center">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-1">
                            E<Eye className="w-9 h-9 text-indigo-500 fill-indigo-500/20" strokeWidth={2.5} />RIS
                        </h1>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mb-6">Error Insight</p>
                    <p className="text-slate-400 text-sm">Login to access the monitoring system</p>
                </div>

                {errorMessage && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <Input
                                id="email"
                                name="email"
                                autoComplete="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all rounded-lg"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <Input
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all rounded-lg"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-slate-600 hover:text-indigo-400 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 mt-4 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</>
                        ) : (
                            "Enter Dashboard"
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center border-t border-slate-800/50 pt-6">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                        Powered by ERIS Engine v2.0
                    </p>
                </div>
            </Card>
        </div>
    );
}
