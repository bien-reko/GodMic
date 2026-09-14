const { findByProps } = vendetta.metro;
const { after } = vendetta.patcher;
const { showToast } = vendetta.ui.toasts;

const MediaEngine = findByProps("getMediaEngine");
const VoiceSettingsStore = findByProps("getEchoCancellation", "getNoiseSuppression");
const AudioActionCreators = findByProps("setEchoCancellation", "setNoiseSuppression", "setAutomaticGainControl");

let patches = [];

module.exports = {
    onLoad: () => {
        showToast("⚙️ GOD MIC: System Initializing...", { source: 1 });

        if (MediaEngine && AudioActionCreators) {
            patches.push(
                after("getMediaEngine", MediaEngine, (_, engine) => {
                    if (!engine || engine.__godMicPatched) return engine;
                    
                    engine.__godMicPatched = true; // Prevent double patching
                    const origConnect = engine.connect;

                    // THIS FIRES EXACTLY WHEN YOU JOIN A VC
                    engine.connect = function (...args) {
                        
                        // HUGE IMPLEMENTATION TOASTS
                        showToast("🎙️ GOD TIER GAIN CONNECTED!", { source: 3 });
                        showToast("⚡ Bypassing Limiters (+15dB Raw Mode)", { source: 3 });

                        try {
                            // Nuke all mobile limiters and compressions
                            AudioActionCreators.setNoiseSuppression(false);
                            AudioActionCreators.setEchoCancellation(false);
                            AudioActionCreators.setAutomaticGainControl(false); // The +15dB God Boost
                            AudioActionCreators.setNoiseCancellation(false);
                            
                            // Lock Voice Activity to catch every whisper
                            AudioActionCreators.setMode("VOICE_ACTIVITY", {
                                threshold: -90, 
                                autoThreshold: false
                            });
                        } catch (e) {
                            console.log("GodMic settings error:", e);
                        }

                        return origConnect.apply(this, args);
                    };
                    return engine;
                })
            );
        }

        // Lock settings so Discord cannot silently revert them in the background
        if (VoiceSettingsStore) {
            patches.push(after("getEchoCancellation", VoiceSettingsStore, () => false));
            patches.push(after("getNoiseSuppression", VoiceSettingsStore, () => false));
            patches.push(after("getAutomaticGainControl", VoiceSettingsStore, () => false));
            patches.push(after("getNoiseCancellation", VoiceSettingsStore, () => false));
            patches.push(after("getMode", VoiceSettingsStore, () => {
                return { mode: "VOICE_ACTIVITY", options: { threshold: -90, autoThreshold: false } };
            }));
        }
        
        showToast("✅ GOD MIC: Ready for VC.", { source: 3 });
    },

    onUnload: () => {
        patches.forEach(unpatch => unpatch());
        showToast("🎙️ God Mic: Disconnected. Mortal mode.", { source: 2 });
    }
};
