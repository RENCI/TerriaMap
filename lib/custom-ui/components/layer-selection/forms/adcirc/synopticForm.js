import React, { useRef, useState, useContext } from "react";
import { Get } from "react-axios";
import { Button, Divider, Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { synopticSchema as schema, defaults } from "./config";
import { CycleField, GridField, InstanceField, DateField } from "./fields";
import { useLayers } from "../../../../context";
import { Match } from "./match";
import CommonStrata from "terriajs/lib/Models/Definition/CommonStrata";

export const SynopticLayerSelectionForm = ({ viewState }) => {
  const { panel, setPanel, catalogFromApi, setCatalogFromApi } = useLayers();
  const [dateValue, setDate] = useState("");
  const [gridValue, setGrid] = useState("");
  const [instanceValue, setInstance] = useState("");
  const [cycleValue, setCycle] = useState("");
  const [newOptions, setNewOptions] = useState(false);
  const [newParams, setNewParams] = useState([["met_class", "synoptic"]]);
  const [resetValue, setResetValue] = useState(false);
  const [matches, setMatches] = useState(false);
  const [resetField, setResetField] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const methods = useForm({
    schema,
    resolver: yupResolver(schema),
    defaultValues: { ...defaults }
  });

  // the url for the get_ui_data api in defined
  // as a plugin in the wwwroot/config.json file (dataFilterURL)
  // these plugin parameters are automatically pulled into
  // the terria viewState as of terriajs lib version 8.2.21
  // the get_pulldown_data endpoint is also constructed from
  // the dataFilterURL config parameter
  //let filter_data_base_url =
  //"https://apsviz-ui-data-dev.apps.renci.org/get_ui_data?";
  //let filter_data_base_url =
  //"https://apsviz-ui-data-dev.apps.renci.org/get_ui_data?project_code=nopp"
  let filter_data_base_url =
    viewState.terria.configParameters.plugins.dataFilterURL;
  filter_data_base_url +=
    filter_data_base_url.charAt(filter_data_base_url.length - 1) == "?"
      ? ""
      : "&";
  const url = new URL(filter_data_base_url);

  let pulldown_data_url =
    url.protocol + "//" + url.host + "/get_pulldown_data" + url.search;

  const submitHandler = (event) => {
    setMatches(!matches);
    setPanel("synoptic");
    let date;
    if (dateValue !== "") {
      date = new Date(dateValue).toISOString().split("T")[0];
    }

    if (
      gridValue !== "" ||
      cycleValue !== "" ||
      instanceValue !== "" ||
      dateValue !== ""
    ) {
      fetch(
        `${filter_data_base_url}?met_class=synoptic&grid_type=${gridValue}&cycle=${cycleValue}&instance_name=${instanceValue}&run_date=${dateValue}`
      )
        .then((response) => response.json())
        .then((data) => {
          viewState.terria.catalog.userAddedDataGroup.addMembersFromJson(
            CommonStrata.definition,
            data.catalog
          );
          setShowWarning(false);
          setCatalogFromApi(data);
        });
    } else {
      setShowWarning(true);
      setCatalogFromApi([]);
    }
  };

  const submitReset = () => {
    setShowWarning(false);
    setDate("");
    setGrid("");
    setInstance("");
    setCycle("");
    setResetField(true);
    setMatches(false);
    setResetValue(true);
    setNewParams([["met_class", "synoptic"]]);
  };

  const createParamData = (arr) => {
    const entries = new Map(arr);
    const obj = Object.fromEntries(entries);
    return obj;
  };

  return (
    <FormProvider {...methods}>
      <Stack spacing={2} component="form">
        <Get url={pulldown_data_url} params={createParamData(newParams)}>
          {(error, response, isLoading, makeRequest, axios) => {
            if (error) {
              return <div>Failed to fetch form option data</div>;
            } else if (isLoading) {
              return <div>Loading...</div>;
            } else if (response !== null) {
              {
                setNewOptions(response.data);
              }
              return (
                <>
                  <DateField
                    formOptions={newOptions}
                    setDate={setDate}
                    setNewParams={setNewParams}
                    newParams={newParams}
                    resetField={resetField}
                    setResetField={setResetField}
                    setShowWarning={setShowWarning}
                  />
                  <CycleField
                    formOptions={newOptions}
                    setCycle={setCycle}
                    setNewParams={setNewParams}
                    newParams={newParams}
                    resetField={resetField}
                    setResetField={setResetField}
                    setShowWarning={setShowWarning}
                  />
                  <GridField
                    formOptions={newOptions}
                    setGrid={setGrid}
                    setNewParams={setNewParams}
                    newParams={newParams}
                    resetField={resetField}
                    setResetField={setResetField}
                    setShowWarning={setShowWarning}
                  />
                  <InstanceField
                    formOptions={newOptions}
                    setInstance={setInstance}
                    setNewParams={setNewParams}
                    newParams={newParams}
                    resetField={resetField}
                    setResetField={setResetField}
                    setShowWarning={setShowWarning}
                  />
                </>
              );
            }
            return <div>Loading form options.</div>;
          }}
        </Get>
        <Button variant="contained" onClick={submitHandler}>
          Search
        </Button>
        <Button variant="contained" onClick={submitReset}>
          Reset
        </Button>
      </Stack>
      {showWarning && (
        <p style={{ color: "red", fontWeight: "bold", fontSize: 20 }}>
          Please select an option before performing a search.
        </p>
      )}
      <br />
      <Divider />
      <br />
      {matches && catalogFromApi.catalog && panel === "synoptic" && (
        <Stack
          sx={{ maxHeight: "400px", overflow: "auto", display: "inline-block" }}
        >
          {catalogFromApi.catalog.map((layer, i) => (
            <React.Fragment key={i}>
              <p style={{ fontWeight: "bold", fontSize: 20 }}>
                {"Synoptic: " + layer.id}
              </p>
              {layer.members.map((member, index) => {
                return (
                  <Match
                    layerMember={member}
                    key={`result-${member.name + index}`}
                    {...member}
                    viewState={viewState}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </Stack>
      )}
    </FormProvider>
  );
};
