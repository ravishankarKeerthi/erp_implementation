from setuptools import find_packages, setup

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

setup(
	name="erp_implementation",
	version="2.0.0",
	description="End-to-end ERP implementation project management app (v2)",
	author="Syvasoft Business Solutions",
	author_email="info@syvasoft.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires,
)
