"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeOpen, EyeClosed } from "../shared/eyes";
import { signup } from "@/lib/auth";
import { saveSession } from "@/lib/storage";

export default function SignupForm() {
	const router = useRouter();
	const [passwordShow, setPasswordShow] = useState(false);
	const [signupDetails, setSignupDetails] = useState({
		email: "",
		password: "",
	});

	const [error, setError] = useState({
		errorExists: false,
		errorMsg: "",
	});

	const submitHandler = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const signInResult = signup(
			signupDetails.email,
			signupDetails.password,
		);

		if (signInResult.success) {
			saveSession(signInResult.session);
			router.push("/dashboard");
		} else {
			setError({
				errorExists: !signInResult.success,
				errorMsg: signInResult.error,
			});
		}
	};
	return (
		<div className="form-card">
			<h1 className="text-2xl font-bold">Create an Account</h1>
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
						data-testid="auth-signup-email"
						value={signupDetails.email}
						onChange={(e) => {
							setSignupDetails((prev) => ({
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
							data-testid="auth-signup-password"
							className="outline-none text-md grow h-full"
							value={signupDetails.password}
							onChange={(e) => {
								setSignupDetails((prev) => ({
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
					data-testid="auth-signup-submit"
				>
					Sign up
				</button>
			</form>
			<p className="text-sm text-center w-full">
				Already have an account?{" "}
				<a
					rel="noopener noreferrer"
					onClick={() => {
						router.push("/login");
					}}
					className="text-blue-500 cursor-pointer font-semibold hover:text-blue-400"
				>
					Log in
				</a>
			</p>
		</div>
	);
}
