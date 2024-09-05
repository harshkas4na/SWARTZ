import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
const client = createThirdwebClient({
  clientId: "862504c5cb8295e0db634f77f0694835",
});

export default function ConnectWallet() {
  return <ConnectButton client={client} theme={"light"} />;
}
