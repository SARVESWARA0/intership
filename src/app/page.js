"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useTaskStore from "../app/store/taskStore"; // adjust path as necessary

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve login state and setter from your Zustand store
  const { isLoggedIn, encodedValue, setLoginData } = useTaskStore();

  // Check if the user is already logged in on component mount
  useEffect(() => {
    if (isLoggedIn) {
      router.push(`/task/${encodeURIComponent(encodedValue)}`);
    }
  }, [isLoggedIn, encodedValue, router]);

  async function handleLogin(e) {
    e.preventDefault();

    // Basic client-side email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setAlert({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setIsLoading(true);
    globalThis.emailmain = email;

    try {
      const response = await fetch("/api/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Non-OK response:", errorText);
        throw new Error("Server responded with an error.");
      }

      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        console.error("Response was not valid JSON:", text);
        throw new Error("Invalid JSON response from server.");
      }

      if (data.exists) {
        // Update the Zustand store: set login flag and encoded value
        setLoginData(email, data.encoded);
        setAlert({ type: "success", message: "Login successful! Redirecting..." });
        setTimeout(() => {
          router.push(`/task/${encodeURIComponent(data.encoded)}`);
        }, 1500);
      } else {
        setAlert({ type: "error", message: "Invalid email. Please try again." });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setAlert({
        type: "error",
        message: "An error occurred during login. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="loginContainer">
      {alert && (
        <div className="alertContainer">
          <div className={`alertMessage ${alert.type === "success" ? "alertSuccess" : "alertError"}`}>
            {alert.message}
          </div>
        </div>
      )}

      <form className="loginCard" onSubmit={handleLogin}>
        <div className="circleTopRight"></div>
        <div className="circleBottomLeft"></div>

        <div className="logoContainer">
          <div className="logoBox">
            <Image
              src="/logo.png"
              alt="Crayon&apos;d Logo"
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
            />
          </div>
          <p className="loginHeading">Crayon&apos;d Gen AI Internship</p>
        </div>

        <div className="inputFieldWrapper">
          <svg
            viewBox="0 0 16 16"
            fill="#2e2e2e"
            xmlns="http://www.w3.org/2000/svg"
            className="inputIcon"
          >
            <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
          </svg>
          <input
            type="text"
            placeholder="Mail ID"
            className="loginInput"
            value={email}
            onChange={(e) => {
              setAlert(null);
              setEmail(e.target.value);
            }}
          />
        </div>

        <button type="submit" id="loginButton" disabled={isLoading}>
          {isLoading ? "Processing..." : "LOGIN"}
        </button>
      </form>
    </div>
  );
}
