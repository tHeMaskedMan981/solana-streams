
import React, { useMemo } from "react";
// import { AccountsProvider } from "./contexts/accounts";
// import { MarketProvider } from "./contexts/market";
// import { AppLayout } from "./components/Layout";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { HomeView } from "./views";
// import {
//   getLedgerWallet,
//   getMathWallet,
//   getPhantomWallet,
//   getSolflareWallet,
//   getSolletWallet,
//   getSolongWallet,
//   getTorusWallet,
// } from "@solana/wallet-adapter-wallets";

export function Routes() {
  // const wallets = useMemo(
  //   () => [
  //     getPhantomWallet(),
  //     getSolflareWallet(),
  //     getTorusWallet({
  //       options: {
  //         // TODO: Get your own tor.us wallet client Id
  //         clientId:
  //           "BOM5Cl7PXgE9Ylq1Z1tqzhpydY0RVr8k90QQ85N7AKI5QGSrr9iDC-3rvmy0K_hF0JfpLMiXoDhta68JwcxS1LQ",
  //       },
  //     }),
  //     getLedgerWallet(),
  //     getSolongWallet(),
  //     getMathWallet(),
  //     getSolletWallet(),
  //   ],
  //   []
  // );

  return (
<Router>
        <div>
          {/* <NavComp
            connected={connected}
            onConnect={this.onConnect}
            disconnect={this.resetApp}
          /> */}

          <Switch>
            <Route exact path="/home">
              <HomeView
                // infuraContract={infuraContract}
                // totalSupply={this.state.totalSupply}
                // currentPhase={this.state.currentPhase}
                // currentRemainingCount={this.state.currentRemainingCount}
              />
            </Route>
            {/* <Route exact path="/gallery">
              <AllPlayers />
            </Route>
            <Route exact path="/playerDetails/:cardName">
              <CardDetails />
            </Route>
            <Route exact path="/proof">
              <Provenance />
            </Route>
            
            <Route exact path="/nftDetails/:id">
              <NFTDetails infuraContract={this.state.infuraContract} />
            </Route>

            <Route exact path="/faq">
              <Faq />
            </Route>
            <Route exact path="/disclaimer">
              <Disclaimer />
            </Route>
            <Route exact path="/terms_of_services">
              <Terms />
            </Route>
            <Route exact path="/privacy_policy">
              <Privacy />
            </Route>

            <Route
              exact
              path="/buy"
              component={() =>
                <BuyCards
                  address={address}
                  connected={connected}
                  cricketContract={cricketContracts}
                  infuraContract={this.state.infuraContract}
                />}
            />

            <Route
              exact
              path="/mywallet"
              component={() =>
                <MyWallet
                  startingIndex={this.state.startingIndex}
                  onConnect={this.onConnect}
                  connected={connected}
                  address={address}
                  cricketContract={cricketContracts}
                />}
            /> */}

            <Redirect exact from="/" to="/home" />
            {/* <Route component={PageNotFound} /> */}
          </Switch>
        </div>
      </Router>
  );
}
