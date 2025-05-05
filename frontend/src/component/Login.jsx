import React, { useEffect, useState } from "react";
import "../component/Main.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { sendOTP, verifyOTP, verifyUser } from "./ApiInstance";

const Login = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(300);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [stopTimer, setStopTimer] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [showJiggle, setShowJiggle] = useState(false);
  const [verifyForm, setVerifyForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  // handle 4 digit otp on chnage
  const handleChange = (e, index) => {
    const value = e.target.value;
    // Allow only numbers and enters only one digit
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value) {
      const inputs = Array.from(document.querySelectorAll(".digit"));

      // Step 1: Try next immediate field
      const nextInput = inputs[index + 1];
      if (nextInput && newOtp[index + 1] === "") {
        nextInput.focus();
      } else {
        // Step 2: If next one is filled, find the next empty input anywhere
        const nextEmpty = inputs.find((input, i) => newOtp[i] === "");
        if (nextEmpty) nextEmpty.focus();
      }
    }
  };
  // backspace navigation and Ctrl+V to trigger onPaste
  const handleKeyDown = (e, index) => {
    // allow backspace navigation
    if (e.key === "Backspace" && !otpDigits[index]) {
      const prevInput = e.target.previousElementSibling;
      if (prevInput && prevInput.tagName === "INPUT") prevInput.focus();
    }

    // **ALLOW** Ctrl+V / Cmd+V to trigger onPaste
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      return;
    }

    // block everything else except digits / backspace / arrows
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Enter"
    ) {
      e.preventDefault();
    }
  };
  // Handle the "paste" event
  const handlePaste = (e, index) => {
    // Prevent the default paste behavior
    e.preventDefault();

    // Get the pasted content
    const pastedData = e.clipboardData.getData("text");

    // Clean the pasted data by removing non-digit characters
    const digits = pastedData.replace(/\D/g, "");

    // If digits were pasted, update the OTP fields
    if (digits) {
      const newOtp = [...otpDigits];

      // Fill the OTP fields with the pasted digits
      for (let i = 0; i < Math.min(digits.length, 4); i++) {
        newOtp[i] = digits[i];
      }

      // Update the OTP digits state
      setOtpDigits(newOtp);

      // Move focus to the next empty input after pasting
      const inputs = Array.from(document.querySelectorAll(".digit"));
      const nextEmpty = inputs.find((input, i) => newOtp[i] === "");
      if (nextEmpty) nextEmpty.focus();
    }
  };
  // for sending otp
  const handleSumbit = async (e) => {
    e.preventDefault();
    if (verifyForm && resendCooldown) return;
    setStopTimer(false);
    setOtpDigits(["", "", "", ""]);
    setMessage("");
    setEmailMessage("");
    setResendCooldown(false);

    // Email format validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{3,}$/;
    if (!emailRegex.test(email)) {
      setEmailMessage("Please enter a valid email address");
      setShowJiggle(true);
      setTimeout(() => setShowJiggle(false), 800);
      return;
    }

    try {
      setLoading(true);
      const res = await sendOTP({ email });
      console.log(res);
      setVerifyForm(true);
      setIsExpired(false);
      toast.success("OTP Send Successfully !");
      if (verifyForm) {
        setTimer(300);
        setResendCooldown(true);
        setTimeout(() => {
          setResendCooldown(false);
        }, 30000);
      }
    } catch (error) {
      console.log(error);
      const errMsg =
        error?.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      setEmailMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };
  // for verify otp
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");

    if (!email) {
      setMessage("Please enter your email before verifying OTP.");
      setShowJiggle(true);
      setTimeout(() => setShowJiggle(false), 800);
      return;
    }

    try {
      setIsVerifying(true);
      const res = await verifyOTP({ otp, email });
      console.log(res);
      localStorage.setItem("token", res.data.token);
      setMessage("");
      toast.success("Login Successfully !");
      navigate("/");
    } catch (error) {
      setMessage(error?.response?.data?.message);
      console.log(error);
      setShowJiggle(true);
      setTimeout(() => setShowJiggle(false), 800);
      if (error?.response?.data?.maxAttempts === 1) {
        setStopTimer(true);
      }
    } finally {
      setIsVerifying(false);
    }
  };
  // show timer for 5 min remaining
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };
  // start timer when otp sent
  useEffect(() => {
    let interval;

    if (verifyForm && timer > 0 && !stopTimer) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setIsExpired(true);
      setMessage("Your OTP has expired. Please request a new one.");
    }

    return () => clearInterval(interval);
  }, [verifyForm, timer]);
  // auto focus input field when its verifyForm
  useEffect(() => {
    if (verifyForm && !isExpired) {
      const firstInput = document.querySelector(".digit");
      if (firstInput) firstInput.focus();
    }
  }, [verifyForm, isExpired]);
  // Verify token before redirecting to home
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setFetchLoading(true);
      const verifyToken = async () => {
        try {
          await verifyUser({ token });
          if (window.location.pathname === "/login") {
            navigate(-1);
          }
        } catch (error) {
          console.log("Invalid token.");
        } finally {
          setFetchLoading(false);
        }
      };
      verifyToken();
    }
  }, [navigate]);

  if (fetchLoading) {
    return <h3>Loading...</h3>;
  }

  return (
    <>
      {verifyForm ? (
        <div className="container">
          <input id="signup_toggle" type="checkbox" />
          <form
            className={`form ${showJiggle ? "jiggle" : ""}`}
            onSubmit={handleVerifyOtp}
          >
            <div className="form_front">
              <div className="form_details">Enter Verification code </div>

              <div className="digit-4">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <input
                      required
                      key={index}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      className={`input digit ${showJiggle ? "jiggle" : ""}`}
                      disabled={isExpired || stopTimer}
                      value={otpDigits[index]}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={(e) => handlePaste(e, index)}
                    />
                  ))}
              </div>

              <button className="btn" disabled={isExpired || stopTimer}>
                {loading
                  ? "Sending OTP..."
                  : isVerifying
                  ? "Verifying..."
                  : isExpired
                  ? "OTP Expired"
                  : "Verify OTP"}
              </button>

              <div className="width">
                <div className="fit">
                  {message && <p className="red errormessage">{message}</p>}
                </div>
                <div className="time">
                  <p className="white">Expires in: {formatTime(timer)}</p>
                  <p
                    className="Change-Email"
                    onClick={() => {
                      setVerifyForm(false);
                      setOtpDigits(["", "", "", ""]);
                      setTimer(300);
                      setIsExpired(false);
                      setMessage("");
                      setLoading(false);
                      setIsVerifying(false);
                    }}
                  >
                    Change Email
                  </p>
                </div>

                <p className="white size">
                  {resendCooldown ? (
                    <>Please wait 30s before requesting a new OTP.</>
                  ) : (
                    <>
                      Didn’t receive the OTP?&nbsp;
                      <span
                        className="Resend-OTP"
                        onClick={!loading ? handleSumbit : undefined}
                      >
                        Resend
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="container">
          <input id="signup_toggle" type="checkbox" />
          <form
            className={`form ${showJiggle ? "jiggle" : ""}`}
            onSubmit={handleSumbit}
          >
            <div className="form_front">
              <div className="space">
                <div className="form_details">OTP Verification </div>
                <span className="white ">
                  We Will send you a Confirmation Code
                </span>
              </div>
              <input
                type="email"
                className={`input ${showJiggle ? "jiggle" : ""}`}
                placeholder="Enter your email"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn">
                {loading ? "Sending OTP..." : "Verify Email"}
              </button>
              {emailMessage && <p className="red">{emailMessage}</p>}
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Login;
