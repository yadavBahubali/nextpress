"use client";
 

import { Provider } from "react-redux";
import { store } from "@/store";
import ThemeInitializer from "./ThemeInitializer";
import BootstrapClient from "./BootstrapClient";
import AOSInit from "./AOSInit";
import AuthInitializer from "./AuthInitializer";
import SetupInitializer from "./SetupInitializer";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <ThemeInitializer />
      <BootstrapClient />
      <AOSInit />
      <SetupInitializer>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </SetupInitializer>
    </Provider>
  );
}