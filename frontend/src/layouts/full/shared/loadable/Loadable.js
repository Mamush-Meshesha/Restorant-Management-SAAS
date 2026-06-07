import React, { Suspense } from "react";
import { Backdrop, CircularProgress } from "@mui/material";

const Loadable = (Component) => (props) =>
  (
    <Suspense
      fallback={
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    >
      <Component {...props} />
    </Suspense>
  );

export default Loadable;
