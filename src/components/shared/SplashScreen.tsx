"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserSession } from "@/lib/storage";

export default function SplashScreen() {
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			const session = getUserSession();

			if (session) {
				router.push("/dashboard");
			} else {
				router.push("/login");
			}
		}, 1500);

		return () => clearTimeout(timer);
	}, [router]);

	return (
		<div
			data-testid="splash-screen"
			className="flex flex-col gap-.5 justify-center items-center text-white"
		>
			<h1 className="text-5xl font-bold text-center">Habit Tracker</h1>
			<p className="text-md">Building better habits daily</p>
		</div>
	);
}
