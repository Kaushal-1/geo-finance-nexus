
import * as React from "react";
import {
  toast as sonnerToast,
  ToastT,
  Toaster as SonnerToaster,
} from "sonner";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastT & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  cancel?: React.ReactNode;
  variant?: "default" | "destructive";
};

type ToastActionElement = React.ReactElement<HTMLButtonElement>;

let memoryState: {
  toasts: ToasterToast[];
} = {
  toasts: [],
};

function dispatch(action: { type: "ADD_TOAST"; toast: ToasterToast }) {
  memoryState = {
    toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
  };
}

interface Toast extends Omit<ToastT, "id"> {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  cancel?: ToastActionElement;
  variant?: "default" | "destructive";
}

type ToastOptions = Omit<Toast, "id" | "title" | "description" | "action">;

const toast = ({ ...props }: Toast) => {
  const id = props.id || String(Date.now());

  // Remove variant from the props passed to sonner toast
  // which doesn't accept this property
  const { variant, ...sonnerProps } = props;

  const update = (props: Toast) => {
    const { variant, ...updateProps } = props;
    sonnerToast.message(props.title as string, {
      id,
      ...updateProps,
    });

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
      },
    });
  };

  const dismiss = () => {
    sonnerToast.dismiss(id);
  };

  sonnerToast(props.title as string, {
    id,
    ...sonnerProps,
  });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
    },
  });

  return {
    id,
    dismiss,
    update,
  };
};

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    toasts: memoryState.toasts,
  };
}

export { useToast, toast };
