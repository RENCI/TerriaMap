import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Drawer } from "./drawer";
import { LayerSelectionMenu, SelectionDialog } from "./layer-selection";
import { addStormLayers } from "./utils/storm-layers";

const LayoutContext = createContext({});

export const useLayout = () => useContext(LayoutContext);

export const Layout = (props) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(true);
  const closeDrawer = () => setDrawerIsOpen(false);
  const openDrawer = () => setDrawerIsOpen(true);
  const toggleDrawer = () => setDrawerIsOpen(!drawerIsOpen);
  const [activeDialog, setActiveDialog] = useState(null);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [stormLayers, setStormLayers] = useState([]);
  // const [stormLayers2, setStormLayers2] = useState([]);
  // const [addedLayers, setAddedLayers] = useState([]);

  // useEffect(
  //   () => {
  //     // add any hurricane layers associated with
  //     // layers that are currently in the workbench

  //     props.viewState.terria.workbench.items.forEach((item) => {
  //       // look for storm layers
  //       // right now base identification on length of Advisory
  //       // length should be 3 or less if it is a storm layer
  //       let test = stormLayers.includes(item.uniqueId)

  //       if (
  //         item.infoAsObject.Advisory &&
  //         item.infoAsObject.Advisory.length < 4
  //       ) {

  //         // now add storm layers associated with this storm, date and advisory
  //         if (test == false) {
  //           setStormLayers([...stormLayers, item.uniqueId])
  //           // setStormLayers2([...stormLayers2, item])
  //           addStormLayers(props.viewState, item);
  //         }
  //       }
  //     });

  //     // stormLayers2.forEach(item => {
  //     //   let test = addedLayers.includes(item.uniqueId)
  //     //   if (test == false) {
  //     //     setAddedLayers([...addedLayers, item.uniqueId])
  //     //     addStormLayers(viewState, item);
  //     //   }
  //     // })
  //   }, [props.viewState.terria.workbench.items]
  // );

  const handleClickOpenDialog = (event) => {
    const { source } = event.target.dataset;
    setDialogIsOpen(true);
    setActiveDialog(source);
  };
  const closeDialog = () => {
    setDialogIsOpen(false);
    const unsetTimer = setTimeout(() => {
      setActiveDialog(null);
    }, 250);
    return () => clearTimeout(unsetTimer);
  };

  return (
    <LayoutContext.Provider
      value={{
        drawerIsOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        dialogIsOpen,
        handleClickOpenDialog,
        closeDialog,
        activeDialog,
        setStormLayers,
        stormLayers
      }}
    >
      {props.children}
      <LayerSelectionMenu viewState={props.viewState} />
      <SelectionDialog viewState={props.viewState} />
      <Drawer terria={props.terria} viewState={props.viewState} />
    </LayoutContext.Provider>
  );
};

// add viewstate to props
Layout.propTypes = {
  children: PropTypes.node
};
