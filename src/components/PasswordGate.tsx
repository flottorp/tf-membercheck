import { ReactNode, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PasswordGateProps = {
	children: ReactNode;
};

const STORAGE_KEY = "password_gate_authenticated";

export function PasswordGate({ children }: PasswordGateProps) {
	const requiredPassword = useMemo(() => {
		const value =
			(import.meta.env.VITE_APP_PASSWORD as string | undefined) ??
			(import.meta.env.VITE_SITE_PASSWORD as string | undefined);

		if (!value) {
			if (import.meta.env.DEV) {
				console.warn(
					"[PasswordGate] No password configured. Set `VITE_APP_PASSWORD` (preferred) or `VITE_SITE_PASSWORD` in your `.env` file."
				);
			}
			return "";
		}

		return value.toString();
	}, []);

	const [authenticated, setAuthenticated] = useState<boolean>(() => {
		try {
			return localStorage.getItem(STORAGE_KEY) === "true";
		} catch {
			return false;
		}
	});
	const [passwordInput, setPasswordInput] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// If no password configured, allow access by default
		if (!requiredPassword) {
			setAuthenticated(true);
		}
	}, [requiredPassword]);

	function handleSubmit(e?: React.FormEvent) {
		e?.preventDefault();
		if (!requiredPassword) {
			setAuthenticated(true);
			return;
		}
		if (passwordInput === requiredPassword) {
			try {
				localStorage.setItem(STORAGE_KEY, "true");
			} catch {
				// ignore storage failure; still allow within this session
			}
			setError(null);
			setAuthenticated(true);
		} else {
			setError("Incorrect password. Please try again.");
		}
	}

	if (authenticated) {
		return <>{children}</>;
	}

	return (
		<div className="min-h-dvh w-full flex items-center justify-center bg-background">
			<form onSubmit={handleSubmit} className="w-full max-w-sm px-4">
				<Card>
					<CardHeader>
						<CardTitle>Enter Password</CardTitle>
						<CardDescription>Access to this site is restricted.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-2">
							<label htmlFor="site-password" className="text-sm font-medium">
								Password
							</label>
							<Input
								id="site-password"
								type="password"
								autoFocus
								value={passwordInput}
								onChange={(e) => setPasswordInput(e.target.value)}
								placeholder="Type password"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSubmit();
									}
								}}
							/>
							{error ? <p className="text-sm text-destructive">{error}</p> : null}
						</div>
						<Button type="submit" className="w-full">
							Unlock
						</Button>
					</CardContent>
				</Card>
			</form>
		</div>
	);
}

export default PasswordGate;


