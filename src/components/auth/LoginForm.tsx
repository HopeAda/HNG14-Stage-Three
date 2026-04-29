"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeOpen, EyeClosed } from "../shared/eyes";
import { login } from "@/lib/auth";
import { saveSession } from "@/lib/storage";

export default function LoginForm() {
	const router = useRouter();
	const [passwordShow, setPasswordShow] = useState(false);
	const [loginDetails, setLoginDetails] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState({
		errorExists: false,
		errorMsg: "",
	});

	const submitHandler = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const loginResult = login(loginDetails.email, loginDetails.password);

		if (loginResult.success) {
			saveSession(loginResult.session);
			router.push("/dashboard");
		} else {
			setError({
				errorExists: !loginResult.success,
				errorMsg: loginResult.error,
			});
		}
	};

	return (
		<div className="form-card">
			<h1 className="text-2xl font-bold">Log in to your Account</h1>
			<form className="form-element" onSubmit={submitHandler}>
				<div className="form-item">
					<label htmlFor="login-email" className="form-label">
						Email
					</label>
					<input
						type="text"
						placeholder="Enter your email"
						id="login-email"
						className="form-input"
						data-testid="auth-login-email"
						value={loginDetails.email}
						onChange={(e) => {
							setLoginDetails((prev) => ({
								...prev,
								email: e.target.value,
							}));
						}}
						autoComplete="off"
					/>
				</div>
				<div className="form-item">
					<label htmlFor="login-password" className="form-label">
						Password
					</label>
					<div
						className="
               form-input flex flex-row justify-between items-center"
					>
						<input
							type={passwordShow ? "text" : "password"}
							placeholder="Enter your password"
							id="login-password"
							className="grow outline-none h-full"
							data-testid="auth-login-password"
							value={loginDetails.password}
							onChange={(e) => {
								setLoginDetails((prev) => ({
									...prev,
									password: e.target.value,
								}));
							}}
							autoComplete="off"
						/>
						<span
							onClick={() => {
								setPasswordShow((prev) => !prev);
							}}
							className="cursor-pointer"
						>
							{passwordShow ? <EyeOpen /> : <EyeClosed />}
						</span>
					</div>
				</div>
				{error.errorExists ? (
					<span className="text-sm text-red-400">
						{error.errorMsg}
					</span>
				) : (
					""
				)}
				<button
					className="bg-blue-500 text-white font-semibold w-full  rounded-md cursor-pointer py-1.5! px-2 hover:bg-blue-400"
					data-testid="auth-login-submit"
				>
					Log in
				</button>
			</form>
			<p className="text-sm text-center w-full">
				Don&apos;t have an account?{" "}
				<a
					rel="noopener noreferrer"
					onClick={() => {
						router.push("/signup");
					}}
					className="text-blue-500 cursor-pointer font-semibold hover:text-blue-400"
				>
					Sign up
				</a>
			</p>
		</div>
	);
}
