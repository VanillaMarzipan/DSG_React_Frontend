FROM node:16 as react-build

ARG REACT_POS_BUILD_NUMBER="BUILD NUMBER NOT SPECIFIED"

WORKDIR /usr/src/app
COPY . .

# Set build number in app
RUN find . -type f -name "*" -exec sed -i -e "s/'#{Build.BuildNumber}#'/${REACT_POS_BUILD_NUMBER}/g" {} +

RUN yarn
RUN REACT_APP_MODE=store-server yarn build

FROM nginx:1.23

COPY --from=react-build /usr/src/app/build /app
COPY --from=react-build /usr/src/app/nginx.docker.conf /etc/nginx/nginx.conf
