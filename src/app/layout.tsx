// import type { Metadata } from "next";
import "./globals.css";
import PWARegister from "./PWARegister";

// export const metadata: Metadata = {
// 	title: "Habit Tracker",
// 	description: "Track your daily habits",
// };

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<link rel="manifest" href="/manifest.json" />
			</head>
			<body>
				<PWARegister />
				{children}
			</body>
		</html>
	);
}
