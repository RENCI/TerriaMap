import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { useLayers } from "../../../context";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { LayerCard } from "./layer-card";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";

import {
  getTrackData,
  getTrackGeojson
} from "../../layer-selection/forms/metget/helpers/track";
import GeoJsonCatalogItem from "terriajs/lib/Models/Catalog/CatalogItems/GeoJsonCatalogItem";
import CompositeCatalogItem from "terriajs/lib/Models/Catalog/CatalogItems/CompositeCatalogItem";
import CommonStrata from "terriajs/lib/Models/Definition/CommonStrata";
import createStratumInstance from "terriajs/lib/Models/Definition/createStratumInstance";
import { InfoSectionTraits } from "terriajs/lib/Traits/TraitsClasses/CatalogMemberTraits";
import LegendTraits from "terriajs/lib/Traits/TraitsClasses/LegendTraits";
import {
  LAYER_TYPES,
  getTruncatedId,
  createComposite
} from "../../utils/storm-layers";
import { observer } from "mobx-react";

export const LayersList = observer(
  ({ viewState, terria, stormLayers, setStormLayers }) => {
    const {
      activatedLayer,
      setActivatedLayer,
      setWebMapCatalogItems,
      toggleLayerSelection,
      checkedLayers,
      setCheckedLayers
    } = useLayers();
    const [checked, setChecked] = React.useState(false);
    const [disableDelete, setDisableDelete] = React.useState(true);
    const [addHurricaneLayers, setAddHurricaneLayers] = React.useState(true);
    const [clearGraph, setClearGraph] = React.useState("");
    const [hurricaneLayers, setHurricaneLayers] = React.useState([]);
    const [addedCards, setAddedCards] = useState([]);
    // const [stormLayers, setStormLayers] = useState([]);

    // useEffect(
    //   () => {
    //     // add any hurricane layers associated with
    //     // layers that are currently in the workbench

    //     viewState.terria.workbench.items.forEach((item) => {
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
    //           addStormLayers(viewState, item);
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
    //   }, [viewState.terria.workbench.items]
    // );

    function addStormLayers(item) {
      const hpostfix = "-hurr_composite";
      let icon_url =
        viewState.terria.configParameters.plugins.hurricaneIconsURL;
      // check to see if this is a storm track layer
      // if so, just return
      if (item.uniqueId.includes(hpostfix)) return;

      // next see if hurricane layers have already been added for this model run
      // TODO: probably need to figure out a better way to do this
      const item_id = getTruncatedId(item.uniqueId);
      let new_id = item_id + hpostfix;
      const layer = viewState.terria.workbench.items.find(
        (list_item) => list_item.uniqueId === new_id
      );

      if (!layer) {
        // get year, storm number, and advisory for this storm
        const year = "20" + item.infoAsObject["EventDate"].slice(0, 2);
        let stormnumber = item.infoAsObject["StormNumber"];
        // storm number can sometimes start with "al" so must remove if so
        if (stormnumber && stormnumber.length > 3)
          stormnumber = stormnumber.slice(2);
        const advisory = item.infoAsObject["Advisory"];
        let track_geojson = {};

        getTrackData(year, stormnumber, advisory).then((track) => {
          if (track != null) {
            track_geojson = getTrackGeojson(
              track,
              "utc",
              item.infoAsObject["StormName"]
            );

            // create a composite type catalog item to store
            // all of the hurricanes layers (track, cone, points)
            // and add to the workbench
            let composite = createComposite(
              icon_url,
              new_id,
              viewState.terria,
              item
            );

            LAYER_TYPES.forEach((layer_type) => {
              new_id = item_id + "-" + layer_type;
              let geojson_item = new GeoJsonCatalogItem(
                new_id,
                viewState.terria
              );
              geojson_item.setTrait(
                CommonStrata.user,
                "geoJsonData",
                track_geojson[layer_type]
              );

              //set traits for styling the hurricane layers
              if (layer_type === "cone") {
                geojson_item.setTrait(CommonStrata.defaults, "style", {
                  //     fill: "#D3D3D3",
                  "fill-opacity": 0,
                  stroke: "#858585",
                  "stroke-width": 2,
                  "stroke-opacity": 1
                });
              }
              if (layer_type === "line") {
                geojson_item.setTrait(CommonStrata.user, "style", {
                  stroke: "#858585",
                  "stroke-width": 2,
                  "stroke-opacity": 1
                });
              }
              if (layer_type === "points") {
                const feature_info = {
                  template:
                    "<div><p><h3>{{storm_name}}</h3></p> \
                  <p><b>Time: </b>{{time_utc}}</p> \
                  <p><b>Max Wind Speed: </b>{{max_wind_speed_mph}}</p> \
                  <p><b>Min Sea Level Pressure: </b>{{minimum_sea_level_pressure_mb}}</p></div>"
                };
                geojson_item.setTrait(
                  CommonStrata.user,
                  "featureInfoTemplate",
                  feature_info
                );

                geojson_item.setTrait(
                  CommonStrata.user,
                  "forceCesiumPrimitives",
                  true
                );
                geojson_item.setTrait(CommonStrata.user, "perPropertyStyles", [
                  {
                    properties: { storm_type: "TD" },
                    style: {
                      "marker-url": icon_url + "dep.png"
                    }
                  },
                  {
                    properties: { storm_type: "TS" },
                    style: {
                      "marker-url": icon_url + "storm.png"
                    }
                  },
                  {
                    properties: { storm_type: "CAT1" },
                    style: {
                      "marker-url": icon_url + "cat_1.png"
                    }
                  },
                  {
                    properties: { storm_type: "CAT2" },
                    style: {
                      "marker-url": icon_url + "cat_2.png"
                    }
                  },
                  {
                    properties: { storm_type: "CAT3" },
                    style: {
                      "marker-url": icon_url + "cat_3.png"
                    }
                  },
                  {
                    properties: { storm_type: "CAT4" },
                    style: {
                      "marker-url": icon_url + "cat_4.png"
                    }
                  },
                  {
                    properties: { storm_type: "CAT5" },
                    style: {
                      "marker-url": icon_url + "cat_5.png"
                    }
                  }
                ]);
              }
              composite.add(CommonStrata.definition, geojson_item);
            });
            viewState.terria.workbench.add(composite);
          }
        });
      }
    }

    useEffect(() => {
      // add any hurricane layers associated with
      // layers that are currently in the workbench
      viewState.terria.workbench.items.forEach((item) => {
        // check addHurricaneLayers state variable to make sure that
        // this viewstate update is not coming from a delete card
        // if it is, set addHurricaneLayers state back to true
        if (addHurricaneLayers) {
          // look for storm layers
          // right now base identification on length of Advisory
          // length should be 3 or less if it is a storm layer
          // and we also need to filter out other hurricane track layers
          if (
            item.infoAsObject.Advisory &&
            item.infoAsObject.Advisory.length < 4 &&
            !item.uniqueId.includes("-hurr_composite")
          ) {
            // now add storm layers associated with this storm, date and advisory
            addStormLayers(item);
          }
        } else {
          setAddHurricaneLayers(true);
        }
      });
    }, [viewState.terria.workbench.items]);

    useEffect(() => {
      const csvType = viewState.terria.workbench.items.find(
        (element) => element.type == "csv"
      );
      if (clearGraph !== csvType) {
        // Used to clear the old plot point from the graph
        let csvLayers = viewState.terria.workbench.items.map((layer) => {
          if (layer.type === "csv") {
            return layer;
          }
        });
        csvLayers.forEach((layer, i) => {
          if (i > 0) {
            viewState.terria.workbench.remove(layer);
          }
        });
        setClearGraph(csvType);
      }
    }, [viewState.terria.workbench.items]);

    // useEffect(() => {
    //   viewState.terria.workbench.items.map(item=>{
    //     let newArr = checkedLayers.filter((o) => o.id !== item.id);

    //     setCheckedLayers([
    //       ...newArr,
    //       {
    //         id: item.id,
    //         checked: false
    //       }
    //     ]);
    //   })

    // }, [viewState.terria.workbench.items]);

    // useEffect(
    //   () => {
    //     // add any hurricane layers associated with
    //     // layers that are currently in the workbench
    //     viewState.terria.workbench.items.map((item) => {
    //       // look for storm layers
    //       // right now base identification on length of Advisory
    //       // length should be 3 or less if it is a storm layer
    //       if (
    //         item.infoAsObject.Advisory &&
    //         item.infoAsObject.Advisory.length < 4
    //       ) {
    //         if (addHurricaneLayers) {
    //           // now add storm layers associated with this storm, date and advisory
    //           addStormLayers(viewState, item);
    //         }
    //       }
    //     });
    //   },
    //   [viewState.terria.workbench.items],
    //   addHurricaneLayers
    // );

    const handleSelectAll = (e) => {
      if (checked === false) {
        setChecked(true);
        setDisableDelete(false);
        checkedLayers.forEach((l) => {
          if (l.checked !== true) {
            l.checked = true;
            l.setChecked(true);
          }
        });
      } else {
        setChecked(false);
        setDisableDelete(true);
        checkedLayers.forEach((l) => {
          if (l.checked === true) {
            l.checked = false;
            l.setChecked(false);
          }
        });
      }
    };

    // const handleDelete = (e) => {
    //   checkedLayers.forEach((l) => {
    //     if (l.checked === true) {
    //       l.delete();
    //     }
    //   });
    // };

    const onDragEnd = (props) => {
      // dropped outside the list
      if (!props.destination) {
        return;
      }

      const layer = viewState.terria.workbench.items.find((item) => {
        return item.uniqueId === props.draggableId;
      });

      viewState.terria.workbench.moveItemToIndex(
        layer,
        props.destination.index
      );
    };

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <Stack
              terria={terria}
              spacing={1}
              padding={1}
              useFlexGap
              sx={{
                overflowY: "auto",
                height: "100%",
                width: "100%",
                background: snapshot.isDraggingOver ? "lightblue" : "#585858",
                maxWidth: "fit-content"
              }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {viewState.terria &&
                viewState.terria.workbench.items.map((layer, index) => {
                  let test = addedCards.includes(layer.uniqueId);
                  if (
                    layer.infoAsObject.Advisory &&
                    layer.infoAsObject.Advisory.length < 4 &&
                    test == false
                  ) {
                    setAddedCards([...addedCards, layer.uniqueId]);
                    return (
                      <Draggable
                        key={layer.uniqueId + index}
                        draggableId={layer.uniqueId}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: snapshot.isDragging
                                ? "lightgreen"
                                : "#585858",
                              ...provided.draggableProps.style
                            }}
                          >
                            <div id={layer.uniqueId}>
                              <LayerCard
                                activatedLayer={activatedLayer}
                                setActivatedLayer={setActivatedLayer}
                                setLayers={setWebMapCatalogItems}
                                viewState={viewState}
                                layer={layer}
                                id={layer.uniqueId}
                                title={layer.name}
                                checkedLayers={checkedLayers}
                                setCheckedLayers={setCheckedLayers}
                                setDisableDelete={setDisableDelete}
                                setAddHurricaneLayers={setAddHurricaneLayers}
                                items={viewState.terria.workbench.items}
                                index={index}
                                stormLayers={stormLayers}
                                setStormLayers={setStormLayers}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  } else if (layer.type !== "csv") {
                    return (
                      <Draggable
                        key={layer.uniqueId}
                        draggableId={layer.uniqueId}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: snapshot.isDragging
                                ? "lightgreen"
                                : "#585858",
                              ...provided.draggableProps.style
                            }}
                          >
                            <div id={layer.uniqueId}>
                              <LayerCard
                                activatedLayer={activatedLayer}
                                setActivatedLayer={setActivatedLayer}
                                setLayers={setWebMapCatalogItems}
                                viewState={viewState}
                                layer={layer}
                                id={layer.uniqueId}
                                title={layer.name}
                                checkedLayers={checkedLayers}
                                setCheckedLayers={setCheckedLayers}
                                setDisableDelete={setDisableDelete}
                                setAddHurricaneLayers={setAddHurricaneLayers}
                                items={viewState.terria.workbench.items}
                                stormLayers={stormLayers}
                                setStormLayers={setStormLayers}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                })}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
);
