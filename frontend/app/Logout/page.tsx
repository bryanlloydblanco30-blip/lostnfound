"use client";

import { useState } from "react";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  // Shared / Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Signup Specific State
  const [srCode, setSrCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/b04a791af5a19579021b5e904efc9979f72c68c0?width=4800"
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
        aria-hidden="true"
      />

      {/* Center wrapper */}
      <div className="relative z-10 flex w-full max-w-[860px] min-h-[575px]">
        {/* Frosted Glass Background Layer */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[16.5px] border border-white/55 rounded-[50px] md:flex overflow-hidden">
             {/* Left side (visible behind Signup form when white card is on the right) */}
             <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/59938ac2b5cb60af076b6615b02ece80fc3c8123?width=894"
                  alt="Lost and Found"
                  className="w-full max-w-[250px] h-auto object-contain"
                />
                
                <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 delay-150 ${isLogin ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  <p className="text-lg font-semibold text-white text-center">Already a member?</p>
                  <button
                    onClick={() => setIsLogin(true)}
                    type="button"
                    className="w-[280px] h-11 bg-white text-[#10b981] text-base font-bold rounded-full border border-black cursor-pointer transition-all hover:bg-gray-50 hover:shadow-lg active:scale-95"
                  >
                    Log In
                  </button>
                </div>
             </div>

             {/* Right side (visible behind Login form when white card is on the left) */}
             <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/59938ac2b5cb60af076b6615b02ece80fc3c8123?width=894"
                  alt="Lost and Found"
                  className="w-full max-w-[250px] h-auto object-contain"
                />
                
                <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 delay-150 ${!isLogin ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  <p className="text-lg font-semibold text-white text-center">Don't have an account?</p>
                  <button
                    onClick={() => setIsLogin(false)}
                    type="button"
                    className="w-[280px] h-11 bg-white text-[#10b981] text-base font-bold rounded-full border border-black cursor-pointer transition-all hover:bg-gray-50 hover:shadow-lg active:scale-95"
                  >
                    Sign Up
                  </button>
                </div>
             </div>
        </div>

        {/* Sliding White Foreground Layer */}
        <div 
          className={`absolute top-0 bottom-0 left-0 w-full md:w-1/2 bg-white rounded-[50px] shadow-[-3px_6px_10px_3px_rgba(0,0,0,0.25)] z-20 flex flex-col overflow-hidden transition-transform duration-700 ease-in-out ${
            !isLogin ? 'translate-x-0 md:translate-x-full' : 'translate-x-0'
          }`}
        >
             {/* Log In Form */}
             <div className={`absolute inset-0 px-8 sm:px-12 py-12 transition-all duration-700 overflow-y-auto flex flex-col justify-center ${!isLogin ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 delay-200'}`}>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#E1F9DC] mb-8 leading-tight text-left">Log In</h1>

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  {/* Email */}
                  <div className="flex flex-col">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-4 border border-gray-200 bg-white/95 rounded-lg text-sm font-medium text-black placeholder:text-black/50 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col">
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 px-4 border border-gray-200 bg-white/95 rounded-lg text-sm font-medium text-black placeholder:text-black/50 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      required
                    />
                  </div>

                  {/* Remember me + Forgot start */}
                  <div className="flex items-center justify-between mt-1 flex-col sm:flex-row gap-2 sm:gap-0">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-black select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-green-500 cursor-pointer"
                      />
                      <span>Remember Me</span>
                    </label>
                    <button type="button" className="text-sm font-semibold text-black underline underline-offset-2 hover:text-green-500 transition-colors">
                      Forgot password
                    </button>
                  </div>

                  {/* Login button */}
                  <button
                    type="submit"
                    className="w-full h-11 bg-[#2c2c2c] text-[#F5F5F5] text-base font-bold rounded-full cursor-pointer transition-all hover:bg-black/90 active:scale-[0.98] mt-2"
                  >
                    Log In
                  </button>

                  <div className="md:hidden flex flex-col items-center mt-2">
                    <span className="text-sm font-medium text-gray-500">Don't have an account?</span>
                    <button type="button" onClick={() => setIsLogin(false)} className="text-green-600 font-bold hover:underline">Sign Up</button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Or Log In Using</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Social buttons */}
                  <div className="flex items-center justify-center gap-4">
                    <SocialButtons />
                  </div>
                </form>
             </div>

             {/* Sign Up Form */}
             <div className={`absolute inset-0 px-8 sm:px-12 py-8 transition-all duration-700 overflow-y-auto flex flex-col justify-center ${isLogin ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 delay-200'}`}>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#E1F9DC] mb-6 leading-tight text-left">Sign Up</h1>

                <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-10 px-4 border border-gray-200 rounded-lg text-sm font-medium text-black placeholder:text-black/50 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <input
                    type="text"
                    placeholder="SR-Code"
                    value={srCode}
                    onChange={(e) => setSrCode(e.target.value)}
                    required
                    className="w-full h-10 px-4 border border-gray-200 rounded-lg text-sm font-medium text-black placeholder:text-black/50 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-10 px-4 border border-gray-200 rounded-lg text-sm font-medium text-black placeholder:text-black/50 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-10 px-4 border border-gray-200 rounded-lg text-sm font-medium text-black placeholder:text-black/50 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-2 cursor-pointer mt-1">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-[18px] h-[18px] border-2 border-gray-300 rounded-sm flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors">
                        {agreed && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-[13px] font-medium text-gray-700 leading-snug">
                      By signing up, you agree to our{" "}
                      <Link 
                        href="/terms" 
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-black hover:underline hover:text-green-600 transition-colors"
                      >
                        Terms and Privacy Policy.
                      </Link>
                    </span>
                  </label>

                  {/* Sign Up button */}
                  <button
                    type="submit"
                    disabled={loading || !agreed}
                    className="w-full h-11 mt-1 bg-[#2c2c2c] text-[#F5F5F5] text-base font-bold rounded-full cursor-pointer transition-all hover:bg-black/100 active:scale-[0.98] disabled:opacity-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing up…
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                  
                  <div className="md:hidden flex flex-col items-center mt-2">
                    <span className="text-sm font-medium text-gray-500">Already a member?</span>
                    <button type="button" onClick={() => setIsLogin(true)} className="text-green-600 font-bold hover:underline">Log In</button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Or Sign Up Using</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Social buttons */}
                  <div className="flex items-center justify-center gap-4">
                    <SocialButtons />
                  </div>
                </form>
             </div>
        </div>
      </div>
    </div>
  );
}

function SocialButtons() {
  return (
    <>
      <button
        type="button"
        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center cursor-pointer transition-all hover:border-green-500 hover:shadow-md"
        aria-label="Continue with Google"
      >
        <GoogleIcon />
      </button>
      <button
        type="button"
        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center cursor-pointer transition-all hover:border-green-500 hover:shadow-md"
        aria-label="Continue with Facebook"
      >
        <FacebookIcon />
      </button>
      <button
        type="button"
        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center cursor-pointer transition-all hover:border-green-500 hover:shadow-md"
        aria-label="Continue with Apple"
      >
        <AppleIcon />
      </button>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
