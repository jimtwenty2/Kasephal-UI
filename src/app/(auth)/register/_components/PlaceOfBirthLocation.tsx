"use client";

import { useEffect, useState } from "react";
import { getProvincesService } from "@/services/location.service";
import { LocationOption } from "@/types/location-options";
import { LocationSelect } from "./LocationSelector";

type Props = {
  error? : string ,
  value: string;
  onChange: (provinceId: string) => void;
};

export default function PlaceOfBirthLocation({ error, value, onChange }: Props) {
  const [provinces, setProvinces] = useState<LocationOption[]>([]);

  useEffect(() => {
    getProvincesService()
      .then((data) => {
        setProvinces(data);
      })
      .catch((err) => {
        throw new Error(err)
      });
  }, []);

  return (
    <div className="w-full space-y-2">
      <LocationSelect
        label="Place of Birth"
        placeholder="Select place of birth"
        value={value}
        options={provinces}
        onChange={onChange}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}