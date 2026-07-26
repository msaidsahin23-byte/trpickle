"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import logoPic from "@/assets/logo.png";
import logoTextPic from "@/assets/logo-text.png";
import { Trophy, Check, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { checkTextSafety } from "@/lib/contentFilter";
import { supabase } from "@/lib/supabase";

const cities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort((a, b) => a.localeCompare(b, 'tr'));

function AuthContent() {
  const searchParams = useSearchParams();
  const isAddAccount = searchParams.get("addAccount") === "true";

  const [activeTab, setActiveTab] = useState<"login" | "signup">(isAddAccount ? "signup" : "signup");
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
  const router = useRouter();
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);

  useEffect(() => {
    if (currentUser && !isAddAccount && !isSignUpSuccess) {
      router.push("/feed");
    }
  }, [currentUser, isAddAccount, isSignUpSuccess, router]);

  useEffect(() => {
    if (isAddAccount) {
      setActiveTab("signup");
    }
  }, [isAddAccount]);

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedCity, setSelectedCity] = useState("İstanbul");
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedBirthdate, setSelectedBirthdate] = useState("");
  const [authError, setAuthError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState("");
  
  const login = useStore(state => state.login);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !email) return;
    setAuthError("");
    setResendSuccess("");
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      setResendSuccess("Doğrulama maili tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.");
      setResendCooldown(60);
    } catch (err: any) {
      setAuthError("Mail gönderilirken hata oluştu: " + err.message);
    }
  };

  const isLengthValid = password.length >= 8;
  const isNumberValid = /\d/.test(password);
  const isLetterValid = /[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(password);
  const isPasswordValid = isLengthValid && isNumberValid && isLetterValid;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (activeTab === "signup") {
      if (!isPasswordValid) {
        setAuthError("Lütfen şifre kurallarını karşılayınız.");
        return;
      }
      
      const cleanUsername = username.trim();
      if (!checkTextSafety(firstName) || !checkTextSafety(lastName) || !checkTextSafety(cleanUsername)) {
        setAuthError("İsim veya kullanıcı adı uygunsuz içerik barındıramaz.");
        return;
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: `${firstName.trim()} ${lastName.trim()}`,
              username: cleanUsername,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              city: selectedCity,
              gender: selectedGender,
              birthdate: selectedBirthdate
            }
          }
        });

        if (error) {
          throw new Error("Kayıt başarısız: " + error.message);
        }

        if (data.user) {
          // Add to public.users table
          const { error: dbError } = await supabase.from('users').insert({
            id: data.user.id,
            email,
            name: `${firstName.trim()} ${lastName.trim()}`,
            username: cleanUsername,
            city: selectedCity,
            gender: selectedGender,
            birthdate: selectedBirthdate,
            singles_rating: 2.5,
            doubles_rating: 2.5,
            role: "user"
          });
          if (dbError) {
             console.error("DB Insert Error", dbError);
          }
        }
        
        setIsSignUpSuccess(true);
      } catch (err: any) {
        if (err.message.includes("Email not confirmed") || err.message.includes("Email rate limit exceeded")) {
          setAuthError("E-posta adresiniz henüz doğrulanmadı. Lütfen gelen kutunuzu kontrol edin.");
        } else {
          setAuthError(err.message);
        }
      }
    } else {
      // LOGIN
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error("Giriş başarısız: " + error.message);
        }

        router.push("/feed");
      } catch (err: any) {
        if (err.message.includes("Email not confirmed")) {
          setAuthError("E-posta adresiniz henüz doğrulanmadı. Lütfen e-postanızı (veya Spam klasörünü) kontrol edip onaylayın.");
        } else if (err.message.includes("Invalid login credentials")) {
          setAuthError("E-posta veya şifre hatalı.");
        } else {
          setAuthError(err.message);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white  rounded-3xl p-8 shadow-sm border border-gray-100  "
      >
        {isSignUpSuccess ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 bg-green-100 text-pb-green rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-pb-dark mb-4">E-posta Adresinizi Doğrulayın</h2>
            <p className="text-gray-600 mb-6 font-medium">
              Kayıt işlemini tamamlamak için <b>{email}</b> adresine bir doğrulama bağlantısı gönderdik. Lütfen e-posta kutunuzu (ve gerekiyorsa Spam/Gereksiz klasörünü) kontrol edin.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Bağlantıya tıkladıktan sonra giriş yapabilirsiniz.
            </p>

            {resendSuccess && (
              <div className="bg-green-50 text-green-600 font-bold text-sm p-3 rounded-xl border border-green-200 text-center w-full mb-4">
                {resendSuccess}
              </div>
            )}
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={handleResendEmail}
                disabled={resendCooldown > 0}
                className="w-full bg-white border-2 border-pb-green text-pb-dark font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Tekrar Gönder (${resendCooldown}s)` : "Doğrulama Mailini Tekrar Gönder"}
              </button>
              <button 
                onClick={() => {
                  setIsSignUpSuccess(false);
                  setActiveTab("login");
                }}
                className="w-full bg-pb-green text-pb-dark font-bold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                Giriş Ekranına Dön
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <Image alt="TRPickle Logo" className="object-contain" height={80} src={logoPic} width={80} />
          </div>
          <Image alt="TRPickle.com Logo" className="object-contain my-2" height={40} src={logoTextPic} width={254} />
          <p className="text-gray-500  font-medium mt-1">Türkiye'nin Pickleball Ağı</p>
        </div>

        {/* Tabs */}
        <div className="flex w-full mb-6 border-b border-gray-100  ">
          <button 
            type="button"
            className={`flex-1 pb-3 text-center font-bold text-lg transition-colors relative ${activeTab === "login" ? "text-pb-dark  " : "text-gray-400 hover:text-gray-600 :text-gray-300"}`}
            onClick={() => {
              setActiveTab("login");
              setPassword("");
              setAuthError("");
            }}
          >
            Giriş Yap
            {activeTab === "login" && (
              <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-1 bg-pb-green rounded-t-full" />
            )}
          </button>
          <button 
            type="button"
            className={`flex-1 pb-3 text-center font-bold text-lg transition-colors relative ${activeTab === "signup" ? "text-pb-dark  " : "text-gray-400 hover:text-gray-600 :text-gray-300"}`}
            onClick={() => {
              setActiveTab("signup");
              setPassword("");
              setAuthError("");
            }}
          >
            Kayıt Ol
            {activeTab === "signup" && (
              <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-1 bg-pb-green rounded-t-full" />
            )}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          {activeTab === "signup" && (
            <>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-sm text-gray-700 ">Ad</label>
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} type="text" maxLength={17} className="w-full border border-gray-200  rounded-xl p-3 bg-gray-50  outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all font-medium text-pb-dark  " />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-sm text-gray-700 ">Soyad</label>
                  <input required value={lastName} onChange={e => setLastName(e.target.value)} type="text" maxLength={17} className="w-full border border-gray-200  rounded-xl p-3 bg-gray-50  outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all font-medium text-pb-dark  " />
                </div>
              </div>
              <div className="mb-1">
                <label className="block font-semibold mb-1 text-sm text-gray-700 ">Kullanıcı Adı</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-bold">@</span>
                  <input 
                    required 
                    value={username} 
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                    type="text" 
                    className={`w-full border rounded-xl p-3 pl-9 outline-none focus:ring-1 transition-all font-medium text-pb-dark ${username.length > 2 && users.some(u => u.username === username) ? 'border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-500' : username.length > 2 ? 'border-pb-green bg-pb-green/5 focus:ring-pb-green/30 focus:border-pb-green' : 'border-gray-200 bg-gray-50 focus:ring-pb-blue/30 focus:border-pb-blue/50'}`} 
                    placeholder="kullaniciadi" maxLength={17} 
                  />
                  {username.length > 2 && (
                    <div className="absolute right-4 top-3.5">
                      {users.some(u => u.username === username) ? (
                         <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                         <CheckCircle2 className="w-5 h-5 text-pb-green" />
                      )}
                    </div>
                  )}
                </div>
                {username.length > 2 && (
                  <p className={`text-xs mt-1.5 font-bold flex items-center gap-1 ${users.some(u => u.username === username) ? 'text-red-500' : 'text-pb-green'}`}>
                    {users.some(u => u.username === username) ? (
                      <>Bu kullanıcı adı zaten alınmış.</>
                    ) : (
                      <>Bu kullanıcı adı alınmaya uygundur.</>
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold mb-1 text-sm text-gray-700 ">Email</label>
            <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border border-gray-200  rounded-xl p-3 bg-gray-50  outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all font-medium text-pb-dark  " />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-sm text-gray-700 ">Şifre</label>
            <input 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200  focus:border-pb-blue/50 focus:ring-pb-blue/30 rounded-xl p-3 bg-gray-50  outline-none focus:ring-1 transition-all font-medium text-pb-dark  " 
            />
            
            
            {activeTab === "signup" ? (
              <ul className="mt-3 flex flex-col gap-2 ml-1">
                <li className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${isLengthValid ? 'text-pb-dark' : 'text-gray-400'}`}>
                  {isLengthValid ? <Check className="w-4 h-4" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1.5 mr-1.5" />}
                  En az 8 karakter
                </li>
                <li className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${isNumberValid ? 'text-pb-dark' : 'text-gray-400'}`}>
                  {isNumberValid ? <Check className="w-4 h-4" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1.5 mr-1.5" />}
                  En az 1 rakam içermeli
                </li>
                <li className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${isLetterValid ? 'text-pb-dark' : 'text-gray-400'}`}>
                  {isLetterValid ? <Check className="w-4 h-4" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1.5 mr-1.5" />}
                  En az 1 harf içermeli
                </li>
              </ul>
            ) : (
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => alert("Şifre sıfırlama yakında eklenecektir!")} className="text-xs font-bold text-pb-blue hover:underline">
                  Şifremi Unuttum
                </button>
              </div>
            )}
          </div>

          {activeTab === "signup" && (
            <>
              <div>
                <label className="block font-semibold mb-1 text-sm text-gray-700">Doğum Tarihi</label>
                <input required type="date" value={selectedBirthdate} onChange={e => setSelectedBirthdate(e.target.value)} className="w-full border border-gray-200  rounded-xl p-3 bg-gray-50  outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all font-medium text-gray-700 cursor-pointer" />
              </div>
              
              <div>
                <label className="block font-semibold mb-1 text-sm text-gray-700">Cinsiyet</label>
                <select required value={selectedGender} onChange={e => setSelectedGender(e.target.value as 'male' | 'female')} className="w-full border border-gray-200  rounded-xl p-3 bg-gray-50  outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all font-medium text-gray-700 cursor-pointer">
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
              </div>

              <div className="w-full">
                <label className="block font-semibold mb-1 text-sm text-gray-700">İl</label>
                <select 
                  required 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full border border-gray-200  rounded-xl p-3 bg-gray-50  outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all font-medium text-gray-700 cursor-pointer"
                >
                  <option value="">İl Seçiniz</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </>
          )}

            {authError && (
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-start gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">{authError}</span>
                </div>
                {(authError.includes("doğrulanmadı") || authError.includes("doYruland")) && (
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendCooldown > 0}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  >
                    {resendCooldown > 0 ? `Tekrar Gönder (${resendCooldown}s)` : "Doğrulama Mailini Tekrar Gönder"}
                  </button>
                )}
                {resendSuccess && (
                  <div className="bg-green-50 text-green-600 font-bold text-sm p-3 rounded-xl border border-green-200 text-center w-full">
                    {resendSuccess}
                  </div>
                )}
              </div>
            )}
            
            <button type="submit" className="w-full bg-pb-green text-pb-dark font-bold py-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 mt-2">
              {activeTab === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-gray-500">
          {activeTab === "login" ? (
            <p>Hesabın yok mu? <button type="button" onClick={() => { setActiveTab("signup"); setPassword(""); }} className="text-pb-blue hover:underline">Kayıt Ol</button></p>
          ) : (
            <p>Zaten bir hesabın var mı? <button type="button" onClick={() => { setActiveTab("login"); setPassword(""); }} className="text-pb-blue hover:underline">Giriş Yap</button></p>
          )}
        </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center font-bold text-slate-500">Kayıt sayfası yükleniyor...</div>}>
      <AuthContent />
    </Suspense>
  );
}
