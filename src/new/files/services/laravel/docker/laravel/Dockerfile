# Create your docker file
FROM php:7.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  libpng-dev \
  libonig-dev \
  libxml2-dev \
  zip \
  unzip \
  gnupg \
  dirmngr

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /usr/site/copy_code
COPY ./src /usr/site/copy_code

RUN composer install && \
  chmod +x ./artisan

WORKDIR /usr/site

COPY ./docker/laravel/onstart.sh /usr/bin/
RUN chmod 755 /usr/bin/onstart.sh

CMD ["onstart.sh"]

EXPOSE 9000