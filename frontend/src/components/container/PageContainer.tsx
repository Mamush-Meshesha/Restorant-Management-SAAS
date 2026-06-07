import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { Helmet } from "react-helmet";

const PageContainer = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <Box height={"calc(100vh - 80px)"}>
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
    {children}
  </Box>
);

export default PageContainer;
