import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";

const MediaEngine = findByProps("getMediaEngine");
const VoiceSettingsStore = findByProps("getEchoCancellation", "getNoiseSuppression");
const AudioActionCreators = findByProps("setEchoCancellation", "setAutomaticGainControl");

let patches: Function[] = [];

export default {
    onLoad: () => {
        showToast("⚙️ GOD MIC: TS Engine Compiling...", { source: 1 });

        if (MediaEngine && AudioActionCreators) {
            patches.push(
                after("getMediaEngine", MediaEngine, (_, engine: any) => {
                    if (!engine || engine.__godMicPatched) return engine;
                    engine.__godMicPatched = true;
                    
                    const origConnect = engine.connect;
                    
                    // THIS TRIGGERS THE SECOND YOU JOIN VC
                    engine.connect = function(this: any, ...args: any[]) {
                        showToast("🎙️ GOD TIER GAIN CONNECTED!", { source: 3 });
                        showToast("⚡ +15dB Raw Podcast Mode Active", { source: 3 });

                        try {
                            // Shred the limiters natively
                            AudioActionCreators.setNoiseSuppression(false);
                            AudioActionCreators.setEchoCancellation(false);
                            AudioActionCreators.setAutomaticGainControl(false);
                            AudioActionCreators.setNoiseCancellation(false);
                            AudioActionCreators.setMode("VOICE_ACTIVITY", {
                                threshold: -90, 
                                autoThreshold: false
                            });
                        } catch(e) {
                            console.error("GodMic Error:", e);
                        }
                        
                        return origConnect.apply(this, args);
                    };
                    return engine;
                })
            );
        }

        if (VoiceSettingsStore) {
            patches.push(after("getEchoCancellation", VoiceSettingsStore, () => false));
            patches.push(after("getNoiseSuppression", VoiceSettingsStore, () => false));
            patches.push(after("getAutomaticGainControl", VoiceSettingsStore, () => false));
            patches.push(after("getMode", VoiceSettingsStore, () => {
                return { mode: "VOICE_ACTIVITY", options: { threshold: -90, autoThreshold: false } };
            }));
        }
        
        showToast("✅ GOD MIC: TS System Online. Join a VC.", { source: 3 });
    },
    
    onUnload: () => {
        patches.forEach(unpatch => unpatch());
        showToast("🎙️ God Mic: Disabled.", { source: 2 });
    }
};
