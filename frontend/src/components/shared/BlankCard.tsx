import { Card, type CardProps } from "@mui/material";
import React from "react"; // Import React for React.ReactNode and React.HTMLAttributes

// Define the interface for the BlankCard component's props
interface BlankCardProps extends Omit<CardProps, "children" | "className"> {
  children: React.ReactNode;
  className?: string;
}

const BlankCard = ({ children, className, ...rest }: BlankCardProps) => {
  return (
    <Card
      sx={{ p: 0, position: "relative" }}
      className={className}
      elevation={9}
      variant={undefined} // Explicitly setting variant to undefined as per your original code
      {...rest} // Spread any other props passed to BlankCard to the Material-UI Card component
    >
      {children}
    </Card>
  );
};

export default BlankCard;
