import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, User, Lock, Sofa } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { login as loginApi } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({
    identifier: "admin@gmail.com",
    password: "admin@9876",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (!formData.identifier.trim() || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginApi(formData.identifier, formData.password);
      loginUser(res.data.accessToken, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f0eb]">
      <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden flex shadow-sm border border-gray-100">
        {/* Left Side - Login Form */}
        <div className="w-1/2 p-10 flex flex-col justify-center">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#c9a96e] rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-gray-900 leading-tight">
                S2 Urban Gaze Interiors
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Admin Panel</p>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-[12px] text-gray-500 mb-6">
            Sign in to your account to continue
          </p>

          {/* Fields */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Identifier */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                Email / Username / Mobile
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  placeholder="admin@gmail.com"
                  className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#c9a96e] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a18] text-[#c9a96e] py-2.5 rounded-lg text-[13px] font-semibold tracking-wide hover:bg-[#2a2a26] transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>

        {/* Right Side - Branding Panel */}
        <div className="w-1/2 bg-[#1a1a18] flex flex-col items-center justify-center px-10 py-12 text-center">
          {/* Icon */}
          <div className="w-14 h-14 bg-[#c9a96e] rounded-xl flex items-center justify-center mb-5">
            <Sofa className="w-7 h-7 text-[#1a1a18]" />
          </div>

          {/* Tagline */}
          <h2 className="text-[22px] font-bold text-white leading-tight mb-3">
            Elevate your <br />
            <span className="text-[#c9a96e]">spaces.</span>
          </h2>

          {/* Divider */}
          <div className="w-8 h-0.5 bg-[#c9a96e] rounded-full mb-4" />

          <p className="text-[12px] text-gray-400 leading-relaxed max-w-[180px]">
            Premium interior design billing & project management
          </p>

          {/* Tag */}
          <div className="mt-5 border border-[#c9a96e] text-[#c9a96e] text-[10px] font-medium tracking-widest px-4 py-1.5 rounded-full">
            S2 URBAN GAZE INTERIORS
          </div>
        </div>
      </div>
    </div>
  );
}
