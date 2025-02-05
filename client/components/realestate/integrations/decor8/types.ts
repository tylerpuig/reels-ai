type RoomType =
  | "livingroom"
  | "kitchen"
  | "diningroom"
  | "bedroom"
  | "bathroom"
  | "kidsroom"
  | "familyroom"
  | "readingnook"
  | "sunroom"
  | "walkincloset"
  | "mudroom"
  | "toyroom"
  | "office"
  | "foyer"
  | "powderroom"
  | "laundryroom"
  | "gym"
  | "basement"
  | "garage"
  | "balcony"
  | "cafe"
  | "homebar"
  | "study_room"
  | "front_porch"
  | "back_porch"
  | "back_patio"
  | "openplan"
  | "boardroom"
  | "meetingroom"
  | "openworkspace"
  | "privateoffice";

type DesignStyle =
  | "minimalist"
  | "scandinavian"
  | "industrial"
  | "boho"
  | "traditional"
  | "artdeco"
  | "midcenturymodern"
  | "coastal"
  | "tropical"
  | "eclectic"
  | "contemporary"
  | "frenchcountry"
  | "rustic"
  | "shabbychic"
  | "vintage"
  | "country"
  | "modern"
  | "asian_zen"
  | "hollywoodregency"
  | "bauhaus"
  | "mediterranean"
  | "farmhouse"
  | "victorian"
  | "gothic"
  | "moroccan"
  | "southwestern"
  | "transitional"
  | "maximalist"
  | "arabic"
  | "japandi"
  | "retrofuturism"
  | "artnouveau";

type ColorScheme =
  | "COLOR_SCHEME_0"
  | "COLOR_SCHEME_1"
  | "COLOR_SCHEME_2"
  | "COLOR_SCHEME_3"
  | "COLOR_SCHEME_4"
  | "COLOR_SCHEME_5"
  | "COLOR_SCHEME_6"
  | "COLOR_SCHEME_7"
  | "COLOR_SCHEME_8"
  | "COLOR_SCHEME_9"
  | "COLOR_SCHEME_10"
  | "COLOR_SCHEME_11"
  | "COLOR_SCHEME_12"
  | "COLOR_SCHEME_13"
  | "COLOR_SCHEME_14"
  | "COLOR_SCHEME_15"
  | "COLOR_SCHEME_16"
  | "COLOR_SCHEME_17"
  | "COLOR_SCHEME_18"
  | "COLOR_SCHEME_19"
  | "COLOR_SCHEME_20";

type SpecialityDecor =
  | "SPECIALITY_DECOR_0"
  | "SPECIALITY_DECOR_1"
  | "SPECIALITY_DECOR_2"
  | "SPECIALITY_DECOR_3"
  | "SPECIALITY_DECOR_4"
  | "SPECIALITY_DECOR_5"
  | "SPECIALITY_DECOR_6"
  | "SPECIALITY_DECOR_7";

export type GenerationRequest = {
  input_image_url: string;
  room_type: RoomType;
  design_style: DesignStyle;
  num_images: number;
  scale_factor?: number;
  color_scheme?: ColorScheme;
  speciality_decor?: SpecialityDecor;
  mask_info?: string;
  prompt?: string;
  prompt_prefix?: string;
  prompt_suffix?: string;
  negative_prompt?: string;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
};

export type GeneratedImage = {
  uuid: string;
  width: number;
  height: number;
  captions: string[];
  url: string;
};

type GenerationInfo = {
  images: GeneratedImage[];
  mask_info: string;
};

export type GenerationResponse = {
  error: string;
  message: string;
  info: GenerationInfo;
};
