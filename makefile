frontend:
	cd frontend && npm run start 

run-b:
	cd backend && templ generate && go run main.go

test-b:
	cd backend && templ generate && go test -v -args generateFile="true" && epubcheck test.epub || rm test.epub

run: frontend backend

build:
	docker build buildx -t dserrano/solpulse:0.0.0 . && docker run

clean:
	rm -rf backend/output/* && rm -rf backend/books/*