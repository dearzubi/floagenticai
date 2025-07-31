import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast, ToastContent, ToastOptions } from "react-toastify";
import { KeyboardEvent } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function successToast(message: ToastContent, options?: ToastOptions) {
  return toast.success(message, {
    className: "w-full",
    position: "top-center",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...(options ? options : {}),
  });
}

export function errorToast(message: ToastContent, options?: ToastOptions) {
  return toast.error(message, {
    className: "w-full",
    position: "top-center",
    autoClose: 10000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...(options ? options : {}),
  });
}

export function infoToast(message: ToastContent, options?: ToastOptions) {
  return toast.info(message, {
    className: "w-full",
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...(options ? options : {}),
  });
}

export function handleEnterKeyPressedInInputField(
  e: KeyboardEvent<HTMLInputElement> | KeyboardEvent,
  callback: () => Promise<void> | void,
) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    callback();
  }
}
