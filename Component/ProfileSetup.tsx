
import React, { useState, useRef, useEffect } from 'react';
import { INTEREST_OPTIONS, RELATIONSHIP_GOALS, PERSONALITY_TRAITS, DEAL_BREAKERS } from '../constants';
import { UserProfile } from '../types';
import { generateSparkPersona, moderateContent, generateBio } from '../services/geminiService';

interface ProfileSetupProps {
  initialName: string;
  onComplete: (profileData: Partial<UserProfile>) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ initialName, onComplete }) => {
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [relationshipGoal, setRelationshipGoal] = useState<string>('monogamous');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedDealBreakers, setSelectedDealBreakers] = useState<string[]>([]);
  const [sparkPersona, setSparkPersona] = useState<string | null>(null);
  const [customBio, setCustomBio] = useState<string>('');
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalSteps = 7;

  const handleNext = async () => {
    if (step === 6) {
      setStep(7);
      setIsGeneratingPersona(true);
      setAiError(false);
      try {
        const persona = await generateSparkPersona(selectedInterests, relationshipGoal || 'monogamous');
        setSparkPersona(persona);
      } catch (err) {
        setSparkPersona("Authentic Spark Seeker");
        setAiError(true);
      } finally {
        setIsGeneratingPersona(false);
      }
    } else if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({
        dateOfBirth: dob,
        userImageUrl: image || 'https://picsum.photos/seed/newuser/400/400',
        interests: selectedInterests,
        relationshipGoal: relationshipGoal,
        personalityTraits: selectedTraits,
        dealBreakers: selectedDealBreakers,
        age: calculateAge(dob),
        bio: customBio || `A unique ${sparkPersona || 'Spark Searcher'} looking for meaningful connections.`
      });
    }
  };

  const handleMagicBio = async () => {
    setIsGeneratingBio(true);
    try {
      const bio = await generateBio(selectedInterests);
      setCustomBio(bio);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return 21;
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const toggleList = (item: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageError(null);
      setIsScanning(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const moderation = await moderateContent({ data: base64Data, mimeType: file.type }, 'image');
          if (!moderation.isSafe) {
            setImageError(moderation.reason || "Invalid image.");
            setImage(null);
          } else {
            setImage(URL.createObjectURL(file));
          }
        } catch (err) {
          setImage(URL.createObjectURL(file));
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase">Birth Date</h2>
            <p className="text-slate-400 text-sm">Must be 18+ to join SparkAI.</p>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white focus:outline-none focus:border-rose-500 transition-all text-xl font-bold" />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in text-center">
            <h2 className="text-3xl font-black text-white italic uppercase">Profile Photo</h2>
            <div onClick={() => !isScanning && fileInputRef.current?.click()} className={`w-56 h-72 mx-auto rounded-[2.5rem] border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 transition-all relative overflow-hidden shadow-2xl ${isScanning ? 'pointer-events-none opacity-50' : ''}`}>
              {image ? <img src={image} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center"><div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"><svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" /></svg></div><span className="text-[10px] font-black uppercase text-slate-500">Upload</span></div>}
              {isScanning && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="w-10 h-10 border-4 border-t-rose-500 rounded-full animate-spin" /></div>}
            </div>
            {imageError && <p className="text-rose-400 text-[10px] font-bold uppercase mt-2">{imageError}</p>}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase">Interests</h2>
            <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {INTEREST_OPTIONS.map(interest => (
                <button key={interest} onClick={() => toggleList(interest, selectedInterests, setSelectedInterests)} className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedInterests.includes(interest) ? 'bg-gradient-to-br from-rose-500 to-indigo-600 border-transparent text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>{interest}</button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase">Relationship Goal</h2>
            <div className="grid grid-cols-1 gap-3">
              {RELATIONSHIP_GOALS.map(goal => (
                <button key={goal.id} onClick={() => setRelationshipGoal(goal.id)} className={`p-5 rounded-3xl flex items-center justify-between border transition-all ${relationshipGoal === goal.id ? 'bg-rose-500/20 border-rose-500' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                  <div className="flex items-center gap-4"><span className="text-3xl">{goal.icon}</span><span className={`block font-black text-xs uppercase tracking-widest ${relationshipGoal === goal.id ? 'text-white' : 'text-slate-400'}`}>{goal.label}</span></div>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase">Traits</h2>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TRAITS.map(trait => (
                <button key={trait} onClick={() => toggleList(trait, selectedTraits, setSelectedTraits)} disabled={selectedTraits.length >= 3 && !selectedTraits.includes(trait)} className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${selectedTraits.includes(trait) ? 'bg-indigo-500 text-white border-transparent' : 'bg-white/5 border-white/10 text-slate-500'}`}>{trait}</button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase">Bio</h2>
            <div className="space-y-4">
              <textarea value={customBio} onChange={(e) => setCustomBio(e.target.value)} placeholder="Tell your story..." className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-5 text-white text-sm focus:outline-none focus:border-rose-500 transition-all resize-none" />
              <button onClick={handleMagicBio} disabled={isGeneratingBio || selectedInterests.length === 0} className="flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase tracking-widest disabled:opacity-30">
                <svg className={`w-4 h-4 ${isGeneratingBio ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {isGeneratingBio ? 'Writing Magic...' : 'AI Magic Bio'}
              </button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-8 animate-fade-in flex flex-col items-center justify-center h-full text-center">
            {isGeneratingPersona ? (
              <div className="space-y-6 flex flex-col items-center"><div className="w-24 h-24 rounded-full border-4 border-t-rose-500 animate-spin" /><h2 className="text-2xl font-black text-white italic uppercase animate-pulse">Syncing Vibe</h2></div>
            ) : (
              <div className="space-y-8 animate-slide-up">
                <div className="relative w-48 h-48 rounded-full border-4 border-rose-500 overflow-hidden shadow-2xl mx-auto"><img src={image || ''} className="w-full h-full object-cover" /></div>
                <div className="space-y-2">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Your Spark Persona</p>
                  <h2 className="text-4xl font-black gradient-text italic uppercase leading-none">{sparkPersona}</h2>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] max-w-xs mx-auto"><p className="text-slate-400 text-xs italic">"We've analyzed your deep preferences. You're ready to find a spark."</p></div>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  const isStepValid = () => {
    if (step === 1) return dob.length > 0 && calculateAge(dob) >= 18;
    if (step === 2) return image !== null && !isScanning;
    if (step === 3) return selectedInterests.length >= 3;
    if (step === 5) return selectedTraits.length > 0;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[250] bg-slate-950 flex flex-col p-8 overflow-y-auto">
      <div className="w-full h-1 bg-white/5 rounded-full mb-12 overflow-hidden max-w-md mx-auto">
        <div className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 transition-all duration-700" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-between">
        <div className="flex-1 flex flex-col justify-center">{renderStep()}</div>
        <div className="pt-10"><button onClick={handleNext} disabled={!isStepValid() || isGeneratingPersona} className="w-full py-5 bg-white text-slate-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl disabled:opacity-30 active:scale-95 transition-all">{step === totalSteps ? "Enter Lounge" : "Continue"}</button></div>
      </div>
    </div>
  );
};

export default ProfileSetup;
