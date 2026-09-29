"use client";

import { useEffect, useState } from "react";
import AdminDropdown from "@/app/(admin-dashboard)/_components/AdminDropdown";
import { Label } from "@/components/ui/label";
import {
  getProvincesService,
  getDistrictsService,
  getCommunesService,
  getVillagesService,
} from "@/services/location.service";
import { LocationOption } from "@/types/location-options";

type SelectedLocation = {
  provinceId: string;
  districtId: string;
  communeId: string | null;
  villageId: string | null;
};

type LocationSelectorErrors = {
  provinceId?: string;
  districtId?: string;
  communeId?: string;
  villageId?: string;
};

type Props = {
  title?: string;
  description?: string;
  provinceOnly?: boolean;
  errors?: LocationSelectorErrors;
  value: SelectedLocation;
  onChange?: (value: SelectedLocation) => void;
};

export default function LocationSelector({
  title = "Farm Location",
  description = "Select province, district, commune and village.",
  provinceOnly = false,
  value,
  errors,
  onChange,
}: Props) {
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [communes, setCommunes] = useState<LocationOption[]>([]);
  const [villages, setVillages] = useState<LocationOption[]>([]);

  const provinceId = value.provinceId;
  const districtId = value.districtId;
  const communeId = value.communeId ?? "";
  const villageId = value.villageId ?? "";

  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    getProvincesService()
      .then(setProvinces)
      .catch((err) =>
        setFetchError(
          err instanceof Error ? err.message : "Failed to fetch provinces",
        ),
      );
  }, []);

  const notifyChange = (nextValue: SelectedLocation) => {
    onChange?.(nextValue);
  };
  useEffect(() => {
    if (!provinceId || provinceOnly) {
      setDistricts([]);
      return;
    }

    async function loadDistricts() {
      try {
        const data = await getDistrictsService(provinceId);
        setDistricts(data);
        setFetchError(null);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to fetch districts",
        );
      }
    }

    loadDistricts();
  }, [provinceId, provinceOnly]);

  useEffect(() => {
    if (!districtId) {
      setCommunes([]);
      return;
    }

    async function loadCommunes() {
      try {
        const data = await getCommunesService(districtId);
        setCommunes(data);
        setFetchError(null);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to fetch communes",
        );
      }
    }

    loadCommunes();
  }, [districtId]);

  useEffect(() => {
    if (!communeId) {
      setVillages([]);
      return;
    }

    async function loadVillages() {
      try {
        const data = await getVillagesService(communeId);
        setVillages(data);
        setFetchError(null);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to fetch villages",
        );
      }
    }

    loadVillages();
  }, [communeId]);

  const handleProvinceChange = (id: string) => {
    onChange?.({
      provinceId: id,
      districtId: "",
      communeId: null,
      villageId: null,
    });
  };

  const handleDistrictChange = (id: string) => {
    onChange?.({
      provinceId,
      districtId: id,
      communeId: null,
      villageId: null,
    });
  };

  const handleCommuneChange = (id: string) => {
    onChange?.({
      provinceId,
      districtId,
      communeId: id,
      villageId: null,
    });
  };

  const handleVillageChange = (id: string) => {
    onChange?.({
      provinceId,
      districtId,
      communeId,
      villageId: id,
    });
  };

  return (
    <div className="space-y-2 rounded-2xl border border-light-grey bg-white p-3">
      <div>
        <h3 className="text-[15px] font-semibold text-primary-heading">
          {title}
        </h3>
        <p className="text-[13px] text-secondary-body">{description}</p>
      </div>

      {fetchError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {fetchError}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <LocationSelect
          label="Province"
          placeholder="Select province"
          value={provinceId}
          required
          options={provinces}
          error={errors?.provinceId}
          onChange={handleProvinceChange}
        />

        {!provinceOnly && (
          <>
            <LocationSelect
              label="District"
              placeholder="Select district"
              value={districtId}
              options={districts}
              required
              disabled={!provinceId}
              error={errors?.districtId}
              onChange={handleDistrictChange}
            />

            <LocationSelect
              label="Commune"
              placeholder="Select commune"
              value={communeId}
              options={communes}
              disabled={!districtId}
              required={false}
              error={errors?.communeId}
              onChange={handleCommuneChange}
            />

            <LocationSelect
              label="Village"
              placeholder="Select village"
              value={villageId}
              options={villages}
              disabled={!communeId}
              required={false}
              error={errors?.villageId}
              onChange={handleVillageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function LocationSelect({
  label,
  placeholder,
  value,
  required = true,
  options,
  disabled,
  error,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: LocationOption[];
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  const selectedOption = options.find((item) => item.id === value);

  const selectedLabel = selectedOption
    ? `${selectedOption.nameEn}-${selectedOption.nameKh}`
    : "";

  const isDisabled = disabled || options.length === 0;
  const isCompactDropdown = ["District", "Commune", "Village"].includes(label);
  const dropdownOptions = options.map((item) => ({
    value: item.id,
    label: `${item.nameEn}-${item.nameKh}`,
  }));

  return (
    <div className="space-y-1">
      <Label className="mb-1.5 block text-[13px] font-bold text-primary">
        {required && <span className="text-red-500">*</span>} {label}
      </Label>

      <AdminDropdown
        value={value}
        disabled={isDisabled}
        options={dropdownOptions}
        placeholder={
          selectedLabel ||
          (options.length === 0 ? "No data available" : placeholder)
        }
        onChange={onChange}
        triggerClassName={`h-10.5 rounded-[10px] px-3 shadow-none ${
          error ? "border-red-500" : "border-light-grey"
        }`}
        menuClassName="font-khmer"
        menuListClassName={isCompactDropdown ? "max-h-30" : "max-h-40"}
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
