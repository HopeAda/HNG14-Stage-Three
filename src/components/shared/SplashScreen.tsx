"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserSession } from "@/lib/storage";
import SplashLogo from "../../../public/icons/icon-512.png";
import Image from "next/image";

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
			className="flex flex-col gap-.5 justify-center items-center text-black"
		>
			<Image
				src={SplashLogo}
				width={100}
				height={100}
				alt="Splashscreen logo"
				className=""
			/>
			<h1 className="text-5xl font-bold text-center">Habit Tracker</h1>
			<p className="text-md">Building better habits daily</p>
		</div>
	);
}
