#!/usr/bin/env python
#########################################################################
#
# Copyright (C) 2016 OSGeo
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

import os
import sys
from django.conf import settings

if __name__ == "__main__":
    
    # installed_apps = settings.INSTALLED_APPS
    # print("List of app labels:>>>")
    # for label in installed_apps:
    #     print(label, flush=True)
    
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "geonode.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
