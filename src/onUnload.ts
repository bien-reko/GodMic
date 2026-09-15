import { patches } from "./onLoad";
import { showToast } from "@vendetta/ui/toasts";

export default function onUnload() {
    patches.forEach(unpatch => unpatch());
    showToast("🎙️ God Mic: Disabled.", { source: 2 });
}
