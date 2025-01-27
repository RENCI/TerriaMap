import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
// import RelatedMaps from "terriajs/lib/ReactViews/RelatedMaps/RelatedMaps";
import StandardUserInterface from "terriajs/lib/ReactViews/StandardUserInterface/StandardUserInterface";
import version from "../../version";
import "./global.scss";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LayersProvider } from "../custom-ui/context";
import { Layout } from "../custom-ui/components/layout";
import { ViewStateProvider } from "terriajs/lib/ReactViews/StandardUserInterface/ViewStateContext";

export default function UserInterface(props) {
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <LayersProvider>
          <ViewStateProvider>
            <Layout viewState={props.viewState} terria={props.terria}>
              <StandardUserInterface
                {...props}
                version={version}
                style={{ maxHeight: "400px !important" }}
              />
            </Layout>
          </ViewStateProvider>
        </LayersProvider>
      </LocalizationProvider>
    </>
  );
}
UserInterface.propTypes = {
  terria: PropTypes.object,
  viewState: PropTypes.object
};
