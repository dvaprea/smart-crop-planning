import axios from 'axios';
import { BarChart3, Bell, CloudRain, Droplets, Eye, EyeOff, FlaskConical, HelpCircle, History, Home, Lock, LogOut, Mail, Menu, Minus, Plus, Settings, Sprout, Thermometer, User, UserCircle, X } from 'lucide-react';
import { useCallback, useState } from 'react';

function App() {
  const [region, setRegion] = useState('');
  const [soil, setSoil] = useState('');
  const [season, setSeason] = useState('');
  const [nitrogen, setNitrogen] = useState(50);
  const [phosphorus, setPhosphorus] = useState(30);
  const [potassium, setPotassium] = useState(40);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(60);
  const [ph, setPh] = useState(6.5);
  const [rainfall, setRainfall] = useState(800);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Dashboard states
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  // Fixed: Single stable form handler
  const handleAuthFormChange = useCallback((field, value) => {
    setAuthForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const toggleDashboard = useCallback(() => {
    setIsDashboardOpen(prev => !prev);
  }, []);

  const VolumeControl = ({ label, value, setValue, min, max, step = 1, unit = '', icon: Icon }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-green-600" />
        <label className="font-medium text-gray-700">{label}</label>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setValue(Math.max(min, value - step))}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isLoggedIn}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-gray-800">{value}{unit}</div>
          <div className="text-sm text-gray-500">{min}-{max}{unit}</div>
        </div>
        <button
          onClick={() => setValue(Math.min(max, value + step))}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isLoggedIn}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full mt-3 accent-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isLoggedIn}
      />
    </div>
  );

  const handleRecommend = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const AZURE_FUNCTION_URL = process.env.REACT_APP_AZURE_FUNCTION_URL;

      if (!AZURE_FUNCTION_URL) {
        throw new Error('Azure Function URL is not defined in environment variables.');
      }

      // Prepare the payload for the Azure Function
      const payload = {
        nitrogen,
        phosphorus,
        potassium,
        temperature,
        humidity,
        ph,
        rainfall
      };

      // If region, soil, and season are required by your model, uncomment the following:
      /*
      const payload = {
        region,
        soil,
        season,
        nitrogen,
        phosphorus,
        potassium,
        temperature,
        humidity,
        ph,
        rainfall
      };
      */

      const response = await axios.post(AZURE_FUNCTION_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Log the full response for debugging
      console.log('Raw response:', JSON.stringify(response.data, null, 2));

      // Map the response, handling both string array and object array cases
      const recommendedCrops = response.data.map(item => {
        if (typeof item === 'string') {
          return {
            name: item || 'Unknown Crop',
            waterNeed: 'N/A',
            idealConditions: 'N/A',
            nutrition: 'N/A',
            yield: 'N/A',
            npk: 'N/A',
            season: 'N/A'
          };
        } else {
          return {
            name: item.crop_name || item.cropName || item.name || 'Unknown Crop',
            waterNeed: item.water_need || item.waterRequirement || item.waterNeed || 'N/A',
            idealConditions: item.conditions || item.idealConditions || 'N/A',
            nutrition: item.nutrition || item.nutritionValue || 'N/A',
            yield: item.yield || item.yieldEstimate || 'N/A',
            npk: item.npk || item.npkRatio || 'N/A',
            season: item.season || item.bestSeason || 'N/A'
          };
        }
      });

      setResults(recommendedCrops.slice(0, 3));
      console.log('Recommendations received:', recommendedCrops);
    } catch (error) {
      console.error('Error fetching recommendations:', error.message);
      alert('Failed to fetch recommendations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = useCallback(() => {
    if (authMode === 'signup') {
      if (authForm.password !== authForm.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      if (authForm.password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
      }
    }

    if (!authForm.email || !authForm.password) {
      alert('Please fill in all required fields!');
      return;
    }

    // Simulate authentication
    setTimeout(() => {
      const userData = {
        name: authForm.name || authForm.email.split('@')[0],
        email: authForm.email
      };
      setUser(userData);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
    }, 1000);
  }, [authMode, authForm]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setResults([]);
    setIsDashboardOpen(false);
    setCurrentView('home');
  };

  const dashboardMenuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const renderDashboardContent = () => {
    switch (currentView) {
      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-green-600">Farmer Profile</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Farm Location</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your farm location"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Farm Size (hectares)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                    placeholder="Enter farm size"
                  />
                </div>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Update Profile
              </button>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Farm Analytics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Total Recommendations</h3>
                <p className="text-3xl font-bold">12</p>
                <p className="text-green-100 text-sm">This month</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Successful Crops</h3>
                <p className="text-3xl font-bold">8</p>
                <p className="text-blue-100 text-sm">Last season</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Average Yield</h3>
                <p className="text-3xl font-bold">3.2</p>
                <p className="text-purple-100 text-sm">tons/hectare</p>
              </div>
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommendation History</h2>
            <div className="space-y-4">
              {[
                { date: '2024-06-15', crops: 'Rice, Wheat, Millet', season: 'Kharif' },
                { date: '2024-05-20', crops: 'Chickpea, Wheat', season: 'Rabi' },
                { date: '2024-04-10', crops: 'Rice, Millet', season: 'Kharif' },
              ].map((record, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{record.crops}</p>
                      <p className="text-sm text-gray-600">Season: {record.season}</p>
                    </div>
                    <p className="text-sm text-gray-500">{record.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
            <div className="space-y-4">
              {[
                { type: 'weather', message: 'Weather alert: Heavy rainfall expected in your region', time: '2 hours ago', urgent: true },
                { type: 'crop', message: 'New crop recommendation available for Rabi season', time: '1 day ago', urgent: false },
                { type: 'update', message: 'Your profile has been updated successfully', time: '3 days ago', urgent: false },
              ].map((notification, idx) => (
                <div key={idx} className={`border-l-4 p-4 rounded-lg ${notification.urgent ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`}>
                  <p className="font-medium text-gray-800">{notification.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" defaultChecked />
                    <span className="text-gray-700">Email notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="text-gray-700">SMS alerts</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" defaultChecked />
                    <span className="text-gray-700">Weather updates</span>
                  </label>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Units</h3>
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-gray-700">Temperature Unit:</span>
                    <select className="ml-3 border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-green-500">
                      <option>Celsius (°C)</option>
                      <option>Fahrenheit (°F)</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-gray-700">Area Unit:</span>
                    <select className="ml-3 border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-green-500">
                      <option>Hectares</option>
                      <option>Acres</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'help':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Help & Support</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  <details className="border border-gray-200 rounded-lg p-4">
                    <summary className="font-medium text-gray-800 cursor-pointer">How do I get accurate crop recommendations?</summary>
                    <p className="text-gray-600 mt-2">Make sure to provide accurate soil test results, current weather conditions, and your regional information for the best recommendations.</p>
                  </details>
                  <details className="border border-gray-200 rounded-lg p-4">
                    <summary className="font-medium text-gray-800 cursor-pointer">What data do I need for soil testing?</summary>
                    <p className="text-gray-600 mt-2">You need NPK values, pH levels, and soil type. Consider getting a professional soil test for accurate results.</p>
                  </details>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Support</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">📧 Email: support@smartcropplanner.com</p>
                  <p className="text-gray-700 mb-2">📞 Phone: +91-XXXX-XXXXXX</p>
                  <p className="text-gray-700">🕒 Support Hours: 9 AM - 6 PM (Mon-Fri)</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <h2 className="text-2xl font-bold">
                {authMode === 'login' ? 'Welcome Back!' : 'Join Smart Crop Planner'}
              </h2>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-green-100 mt-2">
            {authMode === 'login' 
              ? 'Sign in to get personalized crop recommendations' 
              : 'Create an account to access advanced features'
            }
          </p>
        </div>

        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleAuthSubmit(); }}>
          {authMode === 'signup' && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={authForm.name}
                onChange={(e) => handleAuthFormChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => handleAuthFormChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder="Enter your email"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <Lock className="h-4 w-4 inline mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={authForm.password}
                onChange={(e) => handleAuthFormChange('password', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Enter your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={authForm.confirmPassword}
                  onChange={(e) => handleAuthFormChange('confirmPassword', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Dashboard Sidebar */}
      {isLoggedIn && (
        <>
          {/* Dashboard Toggle Button */}
          <div className="fixed top-4 left-4 z-50">
            <button
              onClick={toggleDashboard}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Dashboard Sidebar */}
          <div
            className={`fixed top-0 left-0 h-full bg-green-600 text-white shadow-2xl transition-transform duration-300 z-40 ${
              isDashboardOpen ? 'translate-x-0' : '-translate-x-full'
            } w-80`}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 justify-between">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <button
                  onClick={toggleDashboard}
                  className="hover:bg-green-700 p-2 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="bg-green-600 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white text-green-600 rounded-lg flex items-center justify-center font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name || 'Guest'}</p>
                    <p className="text-green-200 text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                {dashboardMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      if (item.id === 'home') {
                        setIsDashboardOpen(false);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-green-700 text-white'
                        : 'hover:bg-green-700 text-green-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 text-green-100 transition-colors mt-4 border-t border-green-600 pt-4"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Log out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Dashboard Overlay */}
          {isDashboardOpen && (
            <div
              onClick={toggleDashboard}
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
            ></div>
          )}
        </>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isLoggedIn && isDashboardOpen ? 'ml-80' : ''} p-4`}>
        <div className="max-w-7xl mx-auto">
          {/* Show Dashboard Content if not home */}
          {isLoggedIn && currentView !== 'home' ? (
            <div className="pt-16">{renderDashboardContent()}</div>
          ) : (
            <>
              {/* Header with Auth */}
              <div className="flex justify-between items-center mb-8 pt-16 md:pt-0">
                <div className="text-center flex-1">
                  <h1 className="text-5xl font-bold text-green-700 mb-4">
                    🌱✩ Smart Crop Planner
                  </h1>
                  <p className="text-gray-600 text-lg">
                    AI-powered crop recommendations tailored to soil and climate conditions
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {isLoggedIn ? (
                    <div className="flex items-center gap-4">
                      <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || ''}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                    >
                      <User className="h-5 w-5 inline mr-2" />
                      Sign In / Sign Up
                    </button>
                  )}
                </div>
              </div>

              {!isLoggedIn && (
                <div className="border-l-4 border-yellow-400 p-4 mb-8 rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-400">⚠️</div>
                    <p className="text-yellow-800">
                      <strong>Sign in required:</strong> Please sign in to access crop planning features and get personalized recommendations.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Basic Parameters */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">📍 Basic Parameters</h2>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-gray-700 font-medium">Region:</span>
                      <select 
                        value={region} 
                        onChange={(e) => {
                          console.log('Region:', e.target.value);
                          setRegion(e.target.value);
                        }}
                        className="w-full mt-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isLoggedIn}
                      >
                        <option value="">-- Select Region --</option>
                        <option value="North">North India</option>
                        <option value="South">South India</option>
                        <option value="East">East India</option>
                        <option value="West">West India</option>
                        <option value="Central">Central India</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-gray-700 font-medium">Soil Type:</span>
                      <select 
                        value={soil} 
                        onChange={(e) => setSoil(e.target.value)} 
                        className="w-full mt-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isLoggedIn}
                      >
                        <option value="">-- Select Soil Type --</option>
                        <option value="Clay">Clay</option>
                        <option value="Loamy">Loamy</option>
                        <option value="Sandy">Sandy</option>
                        <option value="Silty">Silty</option>
                        <option value="Black">Black Soil</option>
                        <option value="Red">Red Soil</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-gray-700 font-medium">Season:</span>
                      <select 
                        value={season} 
                        onChange={(e) => setSeason(e.target.value)} 
                        className="w-full mt-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isLoggedIn}
                      >
                        <option value="">-- Select Season --</option>
                        <option value="Rabi">Rabi (Winter)</option>
                        <option value="Kharif">Kharif (Monsoon)</option>
                        <option value="Zaid">Zaid (Summer)</option>
                      </select>
                    </label>
                  </div>
                </div>

                {/* Nutrient Parameters */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">🧪 Nutrient & Soil Chemistry</h2>
                  <div className="space-y-4">
                    <VolumeControl
                      label="Nitrogen (N)"
                      value={nitrogen}
                      setValue={setNitrogen}
                      min={0}
                      max={200}
                      step={5}
                      unit=" kg/ha"
                      icon={FlaskConical}
                    />
                    <VolumeControl
                      label="Phosphorus (P)"
                      value={phosphorus}
                      setValue={setPhosphorus}
                      min={0}
                      max={100}
                      unit=" kg/ha"
                      step={2}
                      icon={FlaskConical}
                    />
                    <VolumeControl
                      label="Potassium (K)"
                      value={potassium}
                      setValue={setPotassium}
                      min={0}
                      max={100}
                      unit=" kg/ha"
                      step={2}
                      icon={FlaskConical}
                    />
                    <VolumeControl
                      label="Soil pH"
                      value={ph}
                      setValue={setPh}
                      min={3.0}
                      max={10.0}
                      unit=""
                      step={0.1}
                      icon={FlaskConical}
                    />
                  </div>
                </div>

                {/* Weather Parameters */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">🌦 Weather Conditions</h2>
                  <div className="space-y-4">
                    <VolumeControl
                      label="Temperature"
                      value={temperature}
                      setValue={setTemperature}
                      min={10}
                      max={45}
                      unit="°C"
                      step={1}
                      icon={Thermometer}
                    />
                    <VolumeControl
                      label="Humidity"
                      value={humidity}
                      setValue={setHumidity}
                      min={20}
                      max={100}
                      unit="%"
                      step={5}
                      icon={Droplets}
                    />
                    <VolumeControl
                      label="Annual Rainfall"
                      value={rainfall}
                      setValue={setRainfall}
                      min={100}
                      max={2000}
                      unit=" mm"
                      step={50}
                      icon={CloudRain}
                    />
                  </div>
                </div>
              </div>

              {/* Recommend Crops Button */}
              <div className="text-center mt-8">
                <button
                  type="button"
                  onClick={handleRecommend}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Analyzing Conditions...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sprout className="h-6 w-6" />
                      {isLoggedIn ? 'Get Crop Recommendations' : 'Sign In to Get Recommendations'}
                    </div>
                  )}
                </button>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    🎯 Recommended Crops for Your Conditions
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((crop, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-3xl">🌾</div>
                          <h3 className="text-2xl font-bold text-green-700">{crop.name}</h3>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm text-green-600 font-semibold">
                            ✅ Suitable for your conditions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-16 text-center text-gray-500">
                <p>🤖 Powered by AI & Azure Machine Learning</p>
                <p className="text-sm mt-2">Connected to your Azure Function backend</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal />}
    </div>
  );
}

export default App;
