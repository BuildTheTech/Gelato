import { ReactElement } from "react";
import { Id, toast } from "react-toastify";

interface MyToastProps {
  title?: string | ReactElement;
  content: string | ReactElement;
  autoClose?: number;
}

export const myToast = ({ title, content, autoClose }: MyToastProps) => {
  let toastId: Id = "";

  const dismiss = () => {
    toast.dismiss(toastId);
  };

  toastId = toast(
    <div className="toast-body">
      <div>
        {title && (
          <>
            <div className="toast-title">{title}</div>
            <div className="divider"></div>
          </>
        )}
        <div className="toast-content">{content}</div>
      </div>
      <button onClick={dismiss}></button>
    </div>,
    { closeButton: false, autoClose }
  );
};
