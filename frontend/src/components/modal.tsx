import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { Dispatch, ReactNode, SetStateAction } from "react";

type TSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

export const ModalComponent = ({
  title,
  isOpen,
  onOpenChange,
  children,
  size,
}: {
  title: string;
  isOpen: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
  size?: TSize;
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={size}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
};
