package vn.gomviet.dto;

public class LocationDtos {

    public static class ProvinceResponse {
        private String code;
        private String name;
        private String fullName;

        public ProvinceResponse() {
        }

        public ProvinceResponse(String code, String name, String fullName) {
            this.code = code;
            this.name = name;
            this.fullName = fullName;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
    }

    public static class WardResponse {
        private String code;
        private String name;
        private String fullName;
        private String provinceCode;

        public WardResponse() {
        }

        public WardResponse(String code, String name, String fullName, String provinceCode) {
            this.code = code;
            this.name = name;
            this.fullName = fullName;
            this.provinceCode = provinceCode;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getProvinceCode() {
            return provinceCode;
        }

        public void setProvinceCode(String provinceCode) {
            this.provinceCode = provinceCode;
        }
    }
}
