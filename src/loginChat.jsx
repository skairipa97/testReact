import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

function LoginChat() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        // If user is already logged in, redirect to app1
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            if (userData && userData.id) {
              navigate("/app1");
            }
          } catch (e) {
            localStorage.removeItem("user"); // HADI MAKHEDAMACH HHHH (DB HIA KHEDAMA WALAKIN KHAS TREFRESHI)
          }
        }
      }, [navigate]);
    
      const validateForm = () => {
        if (!formData.email || !formData.password) {
          setError("Please fill in all fields");
          return false;
        }
    
        const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/;
        if (!emailRegex.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
    
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          return false;
        }
    
        return true;
      };
    
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        if (error) setError(null);
      };
    
      const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        setError(null);
    
        try {
          const response = await fetch("http://localhost:8082/testReact/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email.trim(),
              password: formData.password
            }),
            credentials: 'include'
          });
    
          const data = await response.json();
    
          if (response.ok) {
            const userData = {
              id: data.userId,
              timestamp: new Date().getTime()
            };
            localStorage.setItem("user", JSON.stringify(userData));
            navigate("/app1");
          } else {
            setError(data.message || "Login failed. Please check your credentials.");
          }
        } catch (error) {
          console.error("Login error:", error);
          setError("Network error. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                {isLoggedIn ? (
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4 text-green-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Login successful!</h2>
                        <p className="mt-2 text-gray-600">Redirecting you to the application...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                            <p className="mt-2 text-sm text-gray-600">Please sign in to continue</p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                            {error && (
                                <div className="flex items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Signing in...
                                        </span>
                                    ) : (
                                        "Sign in"
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default LoginChat;