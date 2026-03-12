import { DAppKitProvider } from "@vechain/dapp-kit-react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Navbar,
  Footer,
  HomePage,
  CampaignBrowser,
  CreateCampaign,
  CampaignDetails,
  CreatorDashboard,
} from "./components";
import { lightTheme } from "./theme";
import "./index.css";


function App() {
  return (
    <ChakraProvider theme={lightTheme}>
      <DAppKitProvider
        usePersistence
        requireCertificate={false}
        genesis="test"
        nodeUrl="https://testnet.vechain.org/"
        logLevel={"DEBUG"}
      >
        <Router>
          <Box minH="100vh" display="flex" flexDirection="column">
            <Navbar />
            <Box flex={1}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/campaigns" element={<CampaignBrowser />} />
                <Route path="/campaigns/:id" element={<CampaignDetails />} />
                <Route path="/create" element={<CreateCampaign />} />
                <Route path="/dashboard" element={<CreatorDashboard />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </DAppKitProvider>
    </ChakraProvider>
  );
}

export default App;
