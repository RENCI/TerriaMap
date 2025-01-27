import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, CardActions, CardContent, IconButton } from "@mui/material";
import {
  Close as CloseIcon,
  ChevronRight as InspectIcon,
  Map as OnMapIcon,
  Delete as DeselectIcon
} from "@mui/icons-material";
import { useLayers } from "../../../context";
import CommonStrata from "terriajs/lib/Models/Definition/CommonStrata";
import React from "react";
import {
  // setDefaultParameters,
  // getCurrentParametersRange,
  getDefaultMaxRange
  // getDefaultMaxSliderRange,
  // getMaxSliderRange
} from "../../utils/edit-range-utils";
import { removeStormLayers } from "../../utils/storm-layers";
import Checkbox from "@mui/material/Checkbox";

export const LayerCard = ({
  id,
  // title,
  layer,
  viewState,
  setLayers,
  setActivatedLayer,
  setCheckedLayers,
  checkedLayers,
  setDisableDelete,
  setAddHurricaneLayers,
  index,
  stormLayers,
  setStormLayers
}) => {
  const {
    activeLayerId,
    setActiveLayerId,
    setActivatedLayerParams,
    activatedLayerParams,
    setActiveLayerParams,
    toggleLayerSelection,
    layerIsSelected
  } = useLayers();
  const [checked, setChecked] = React.useState(false);
  const [ch, setCh] = React.useState(true);
  const [alreadyExists, setAlreadyExists] = React.useState(false);
  // setAddHurricaneLayers(true);

  // convert the product type to a readable layer name
  const layer_names = {
    obs: "Observations",
    maxwvel63: "Maximum Wind Velocity",
    maxele63: "Maximum Water Level",
    swan_HS_max63: "Maximum Significant Wave Height",
    maxinundepth63: "Maximum Inundation Depth",
    maxele_level_downscaled_epsg4326: "Hi-Res Maximum Water Level",
    hec_ras_water_surface: "HEC/RAS Water Surface",
    hurr_composite: "Hurricane Track"
  };

  // format date - looks like this yymmdd
  let event_date = "";
  if (layer.infoAsObject.EventDate) {
    const year = "20" + layer.infoAsObject.EventDate.slice(0, 2); // This should be okay for 75 years :)
    const month = layer.infoAsObject.EventDate.slice(2, 4) - 1; // months start at 0
    const day = layer.infoAsObject.EventDate.slice(4, 6);
    event_date = new Date(year, month, day).toDateString();
  }

  const [active, setActive] = useState(layer.show);
  const currentlyActive = useMemo(() => id === activeLayerId, [activeLayerId]);

  // useEffect(() => {
  //   const containsLayer = checkedLayers.some(
  //     (item) => item.id == layer.uniqueId
  //   );
  //   if (containsLayer) {
  //     setAlreadyExists(true);
  //   } else if (ch) {
  //     setCheckedLayers([
  //       ...checkedLayers,
  //       {
  //         id: layer.uniqueId,
  //         delete: handleRemoveLayer,
  //         checked: checked,
  //         setChecked: setChecked
  //       }
  //     ]);
  //     setCh(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   // if (checkedLayers.includes(layer) == false) {
  //   // console.log(layer)
  //   // let newArr = checkedLayers.filter((o) => o.id !== id);

  //   // setCheckedLayers([
  //   //   ...newArr,
  //   //   {
  //   //     id: id,
  //   //     delete: handleRemoveLayer,
  //   //     checked: checked,
  //   //     setChecked: setChecked
  //   //   }
  //   // ]);
  //   if (ch) {
  //     setCheckedLayers([
  //       ...checkedLayers,
  //       {
  //         id: layer.uniqueId,
  //         delete: handleRemoveLayer,
  //         checked: checked,
  //         setChecked: setChecked
  //       }
  //     ]);
  //     setCh(false);
  //   }
  // }, []);

  // This function removes the layer from the workbench/map and from the context to sync the changes to the UI
  const handleRemoveLayer = () => {
    // Check if layer has been selected in matches so that we may remove it
    if (layerIsSelected(layer.uniqueId)) {
      toggleLayerSelection(layer.uniqueId);
    }
    currentlyActive && setActivatedLayer(false);
    // Check if this is a hurricane track layer
    if (
      layer.uniqueId.includes("-hurr_composite") ||
      (layer.infoAsObject.Advisory && layer.infoAsObject.Advisory.length < 4)
    ) {
      setAddHurricaneLayers(false);
    }
    viewState.terria.workbench.remove(layer);
    setLayers(viewState.terria.workbench.items);
  };
  // This is for the layer visibility button, toggles visibility on and off
  const handleShowLayerSwitch = () => {
    // need to do some extra stuff here for the hurricane composite
    // layers since they are buggy when setting visibility trait
    if (layer.uniqueId.includes("hurr_composite")) {
      layer.memberModels.forEach((member) => {
        member.setTrait(CommonStrata.user, "show", !layer.show);
      });
    }
    layer.setTrait(CommonStrata.user, "show", !layer.show);
    setActive(layer.show);
  };
  // This makes sure the correct layer is showing in the information section
  const handleActivatedLayer = () => {
    // Set the color scale params for the clicked layer
    // If the params already exist skip
    if (activatedLayerParams.some((item) => item.id === id)) {
      activatedLayerParams.forEach((element) => {
        if (element.id === id) {
          setActiveLayerParams(element.params);
        }
      });
    } else {
      setActivatedLayerParams([
        ...activatedLayerParams,
        {
          id: id,
          params: [0, getDefaultMaxRange(layer)]
        }
      ]);
      setActiveLayerParams([0, getDefaultMaxRange(layer)]);
    }

    currentlyActive ? setActiveLayerId(null) : setActiveLayerId(id);
    setActivatedLayer(layer);
  };
  // Clears the information section when the X is clicked
  const handleDeactivateLayer = () => {
    currentlyActive ? setActiveLayerId(null) : setActiveLayerId(id);
    setActivatedLayer(false);
  };

  const result = checkedLayers.filter((layerObj) => layerObj.id != id);

  // const handleChange = (event) => {
  //   setChecked(event.target.checked);

  //   if (event.target.checked) {
  //     setDisableDelete(false);
  //   } else if (result.length < 1) {
  //     setDisableDelete(true);
  //   } else if (result.length >= 1) {
  //     setDisableDelete(true);
  //     result.forEach((layer) => {
  //       if (layer.checked === true) setDisableDelete(false);
  //     });
  //   }

  //   setCheckedLayers([
  //     ...result,
  //     {
  //       id: id,
  //       delete: handleRemoveLayer,
  //       checked: event.target.checked,
  //       setChecked: setChecked
  //     }
  //   ]);
  // };

  if (alreadyExists) {
    return null;
  }

  return (
    <Card
      sx={{
        // width: "325px",
        backgroundColor: currentlyActive ? "white" : "darkgrey",
        color: currentlyActive ? "#000c" : "#fffc",
        transition: "background-color 250ms, color 500ms",
        display: "flex",
        ".layer-name": {
          flex: 1,
          p: 0,
          pl: 2,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "start",
          fontSize: "12px",
          flexWrap: "wrap"
        },
        ".actions": {
          padding: 0,
          gap: 0,
          backgroundColor: "#fff3",
          flexDirection: "column",
          ".MuiButtonBase-root": {
            borderRadius: 0,
            m: 0,
            width: "30px",
            height: "45px",
            "& .selection-icon": {
              transition: "color 250ms"
            },
            "&:hover .selection-icon": {
              // color: "crimson"
            }
          }
        },
        ".layer-button": {
          height: "-webkit-fill-available",
          borderRadius: "0%"
        }
      }}
    >
      <CardActions className="actions">
        <IconButton onClick={() => handleShowLayerSwitch()}>
          <OnMapIcon
            color={active ? "primary" : "disabled"}
            sx={{ color: active && "#008da9" }}
          />
        </IconButton>
        <IconButton onClick={() => handleRemoveLayer()}>
          <DeselectIcon
            color="error"
            fontSize="small"
            className="selection-icon"
          />
        </IconButton>
        {/* <Checkbox
          sx={{
            color: "#008daa",
            "&.Mui-checked": {
              color: "#008daa"
            }
          }}
          checked={checked}
          onChange={handleChange}
          inputProps={{ "aria-label": "controlled" }}
        /> */}
      </CardActions>
      <CardContent className="layer-name" style={{ padding: "10px" }}>
        {layer.infoAsObject.ProductType && (
          <p
            style={{
              color: "black",
              width: "100%",
              margin: 0,
              fontSize: "12px"
            }}
          >
            <span style={{ fontWeight: "bold" }}>{"Layer: "}</span>
            {layer_names[layer.infoAsObject.ProductType]}
          </p>
        )}

        {layer.infoAsObject.Advisory && layer.infoAsObject.Advisory.length < 4 && (
          <p
            style={{
              color: "black",
              width: "100%",
              margin: 0,
              fontSize: "12px"
            }}
          >
            <span style={{ fontWeight: "bold" }}>{"Storm Name: "}</span>
            {layer.infoAsObject.StormName}
          </p>
        )}
        {layer.infoAsObject.Advisory &&
        layer.infoAsObject.Advisory.length < 4 ? (
          <p
            style={{
              color: "black",
              width: "100%",
              margin: 0,
              fontSize: "12px"
            }}
          >
            <span style={{ fontWeight: "bold" }}>{"Advisory: "}</span>
            {layer.infoAsObject.Advisory}
          </p>
        ) : (
          <p
            style={{
              color: "black",
              width: "100%",
              margin: 0,
              fontSize: "12px"
            }}
          >
            <span style={{ fontWeight: "bold" }}>{"Cycle: "}</span>
            {layer.infoAsObject.Cycle}
          </p>
        )}
        <p
          style={{ color: "black", width: "100%", margin: 0, fontSize: "12px" }}
        >
          <span style={{ fontWeight: "bold" }}>{"Date: "}</span>
          {event_date}
        </p>
        <p
          style={{ color: "black", width: "100%", margin: 0, fontSize: "12px" }}
        >
          <span style={{ fontWeight: "bold" }}>{"Grid: "}</span>
          {layer.infoAsObject.GridType}
        </p>
        <p
          style={{ color: "black", width: "100%", margin: 0, fontSize: "12px" }}
        >
          <span style={{ fontWeight: "bold" }}>{"Type: "}</span>
          {layer.infoAsObject.EventType}
        </p>
        <p
          style={{ color: "black", width: "100%", margin: 0, fontSize: "12px" }}
        >
          <span style={{ fontWeight: "bold" }}>{"Location: "}</span>
          {layer.infoAsObject.Location}
        </p>
        <p
          style={{ color: "black", width: "100%", margin: 0, fontSize: "12px" }}
        >
          <span style={{ fontWeight: "bold" }}>{"Instance: "}</span>
          {layer.infoAsObject.InstanceName}
        </p>
      </CardContent>
      <CardActions>
        {currentlyActive ? (
          <IconButton
            className="layer-button"
            onClick={() => handleDeactivateLayer()}
          >
            <CloseIcon color="error" fontSize="small" />
          </IconButton>
        ) : (
          <IconButton
            className="layer-button"
            onClick={() => handleActivatedLayer()}
          >
            <InspectIcon />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
};

LayerCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};
