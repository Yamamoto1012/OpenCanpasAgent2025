import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n";
import App from "./App.tsx";

// QueryClientのインスタンスを作成
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2, // リトライ回数
			staleTime: 5 * 60 * 1000, // 5分間はデータを新鮮とみなす
			gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持
		},
	},
});

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
			{/* 開発環境でのみReact Query DevToolsを表示 */}
			{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	</StrictMode>,
);
